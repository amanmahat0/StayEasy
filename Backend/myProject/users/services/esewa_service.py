"""
eSewa 2.0 (EPAY2) Payment Gateway Integration
Implements SHA256 signature verification and secure payment processing
"""

import hashlib
import hmac
import base64
import json
import requests
from decimal import Decimal
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status


class EsewaPaymentService:
    """Service for eSewa 2.0 payment processing"""
    
    # eSewa Configuration
    ESEWA_MERCHANT_CODE = getattr(settings, 'ESEWA_MERCHANT_CODE', 'EPAYTEST')
    ESEWA_SECRET_KEY = getattr(settings, 'ESEWA_SECRET_KEY', '')
    
    # eSewa Endpoints
    ESEWA_SANDBOX_URL = 'https://rc-epay.esewa.com.np/api/epay/txn/v1/verify/'
    ESEWA_PRODUCTION_URL = 'https://epay.esewa.com.np/api/epay/txn/v1/verify/'
    
    # Use sandbox for development
    ESEWA_VERIFY_URL = ESEWA_SANDBOX_URL
    
    @staticmethod
    def generate_signature(data_dict, secret_key):
        """
        Generate SHA256 HMAC signature for eSewa 2.0
        
        Args:
            data_dict: Dictionary with payment data
            secret_key: eSewa secret key
            
        Returns:
            Base64 encoded signature
        """
        # Create message string: "amount,scd,refId"
        message = f"{data_dict.get('amount')},{data_dict.get('scd')},{data_dict.get('refId')}"
        
        # Generate HMAC SHA256
        signature = hmac.new(
            secret_key.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).digest()
        
        # Base64 encode
        signature_b64 = base64.b64encode(signature).decode('utf-8')
        
        return signature_b64
    
    @staticmethod
    def verify_signature(response_data, secret_key):
        """
        Verify SHA256 signature from eSewa 2.0 response
        
        Args:
            response_data: Dictionary with eSewa response
            secret_key: eSewa secret key
            
        Returns:
            Boolean indicating if signature is valid
        """
        try:
            # Extract signature from response
            signature_from_response = response_data.get('signature', '')
            
            # Recreate message: "amount,scd,refId"
            message = f"{response_data.get('amount')},{response_data.get('scd')},{response_data.get('refId')}"
            
            # Generate expected signature
            expected_signature = hmac.new(
                secret_key.encode('utf-8'),
                message.encode('utf-8'),
                hashlib.sha256
            ).digest()
            
            expected_signature_b64 = base64.b64encode(expected_signature).decode('utf-8')
            
            # Compare signatures (constant time comparison to prevent timing attacks)
            return hmac.compare_digest(signature_from_response, expected_signature_b64)
        except Exception as e:
            print(f"Signature verification error: {e}")
            return False
    
    @classmethod
    def initiate_payment(cls, booking, return_url):
        """
        Initiate eSewa 2.0 payment for a booking
        
        Args:
            booking: Booking object
            return_url: URL to redirect after payment
            
        Returns:
            Dictionary with payment initiation data
        """
        # Convert amount to integer (eSewa requires amount in paisa)
        amount = int(Decimal(booking.total_price) * 100)
        
        # Service charge (2% of amount) and delivery charge (0%)
        service_charge = int(amount * 0.02)  # 2%
        delivery_charge = 0
        
        # Generate reference ID (combination of booking ID and timestamp)
        from time import time
        ref_id = f"booking_{booking.id}_{int(time())}"
        
        # Prepare payment data for signature (signing amount without charges)
        signature_data = {
            'amount': str(amount),
            'scd': cls.ESEWA_MERCHANT_CODE,
            'refId': ref_id,
        }
        
        # Generate signature (based on amount without charges)
        signature = cls.generate_signature(signature_data, cls.ESEWA_SECRET_KEY)
        
        # Store transaction reference for verification
        booking.esewa_ref_id = ref_id
        booking.esewa_signature = signature
        booking.save()
        
        # Return complete payment data with all required fields for eSewa form
        return {
            'amt': str(amount),  # Amount in paisa (without charges)
            'psc': str(service_charge),  # Service charge
            'pdc': str(delivery_charge),  # Delivery charge
            'txAmt': str(amount + service_charge + delivery_charge),  # Total amount
            'tAmt': str(amount + service_charge + delivery_charge),  # Transaction amount
            'pid': str(booking.id),  # Product ID (booking ID)
            'scd': cls.ESEWA_MERCHANT_CODE,  # Merchant code
            'refId': ref_id,  # Reference ID
            'signature': signature,  # HMAC signature
            'su': return_url,  # Success URL
            'fu': return_url,  # Failure URL
        }
    
    @classmethod
    def verify_payment(cls, response_data):
        """
        Verify eSewa 2.0 payment response with server-side verification
        
        Args:
            response_data: Dictionary with eSewa response
            
        Returns:
            Tuple (is_valid, message, transaction_data)
        """
        try:
            # Step 1: Verify signature
            if not cls.verify_signature(response_data, cls.ESEWA_SECRET_KEY):
                return False, "Invalid signature", None
            
            # Step 2: Verify with eSewa server
            verification_response = cls._verify_with_esewa_server(response_data)
            
            if verification_response.get('status') != 'COMPLETE':
                return False, f"Payment verification failed: {verification_response.get('message', 'Unknown error')}", None
            
            # Step 3: Extract transaction details
            transaction_data = {
                'transaction_id': response_data.get('oid'),
                'ref_id': response_data.get('refId'),
                'amount': response_data.get('amount'),
                'scd': response_data.get('scd'),
                'signature': response_data.get('signature'),
                'status': response_data.get('status', 'COMPLETE'),
            }
            
            return True, "Payment verified successfully", transaction_data
            
        except Exception as e:
            return False, f"Verification error: {str(e)}", None
    
    @classmethod
    def _verify_with_esewa_server(cls, response_data):
        """
        Make server-to-server verification call to eSewa
        
        Args:
            response_data: eSewa response data
            
        Returns:
            Verification response from eSewa
        """
        try:
            # Prepare verification request
            verification_payload = {
                'amount': response_data.get('amount'),
                'scd': response_data.get('scd'),
                'refId': response_data.get('refId'),
                'oid': response_data.get('oid'),
            }
            
            # Make verification request to eSewa
            response = requests.post(
                cls.ESEWA_VERIFY_URL,
                json=verification_payload,
                timeout=10,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {
                    'status': 'FAILED',
                    'message': f'eSewa server returned status {response.status_code}'
                }
                
        except requests.RequestException as e:
            return {
                'status': 'FAILED',
                'message': f'Network error: {str(e)}'
            }
        except Exception as e:
            return {
                'status': 'FAILED',
                'message': f'Verification error: {str(e)}'
            }


def create_esewa_payment_link(booking, return_url):
    """
    Create eSewa payment data with all required parameters
    
    Args:
        booking: Booking object
        return_url: Callback URL after payment
        
    Returns:
        Payment data dictionary ready for form submission
    """
    service = EsewaPaymentService()
    payment_data = service.initiate_payment(booking, return_url)
    
    # Return all data ready for eSewa form submission
    return payment_data
