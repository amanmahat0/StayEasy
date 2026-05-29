"""
eSewa 2.0 (EPAY2) Payment Gateway Integration
Implements SHA256 signature verification and secure payment processing

Environment modes:
  - 'sandbox' (default): Uses sandbox credentials and test URLs
  - 'production': Uses live credentials and production URLs
"""

import hashlib
import hmac
import base64
import json
import requests
from decimal import Decimal
from django.conf import settings


class EsewaPaymentService:
    """Service for eSewa 2.0 payment processing"""
    
    # eSewa Configuration
    ESEWA_ENVIRONMENT = getattr(settings, 'ESEWA_ENVIRONMENT', 'sandbox')
    ESEWA_MERCHANT_CODE = getattr(settings, 'ESEWA_MERCHANT_CODE', 'EPAYTEST')
    ESEWA_SECRET_KEY = getattr(settings, 'ESEWA_SECRET_KEY', '')
    
    # eSewa Endpoints
    ESEWA_SANDBOX_FORM_URL = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'
    ESEWA_PRODUCTION_FORM_URL = 'https://epay.esewa.com.np/api/epay/main/v2/form'
    ESEWA_SANDBOX_VERIFY_URL = 'https://rc-epay.esewa.com.np/api/epay/txn/v1/verify/'
    ESEWA_PRODUCTION_VERIFY_URL = 'https://epay.esewa.com.np/api/epay/txn/v1/verify/'
    
    @classmethod
    def is_sandbox(cls):
        return cls.ESEWA_ENVIRONMENT == 'sandbox'
    
    @classmethod
    def get_form_url(cls):
        return cls.ESEWA_SANDBOX_FORM_URL if cls.is_sandbox() else cls.ESEWA_PRODUCTION_FORM_URL
    
    @classmethod
    def get_verify_url(cls):
        return cls.ESEWA_SANDBOX_VERIFY_URL if cls.is_sandbox() else cls.ESEWA_PRODUCTION_VERIFY_URL
    
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
        message = f"{data_dict.get('amount')},{data_dict.get('scd')},{data_dict.get('refId')}"
        signature = hmac.new(
            secret_key.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).digest()
        return base64.b64encode(signature).decode('utf-8')
    
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
            signature_from_response = response_data.get('signature', '')
            message = f"{response_data.get('amount')},{response_data.get('scd')},{response_data.get('refId')}"
            expected_signature = hmac.new(
                secret_key.encode('utf-8'),
                message.encode('utf-8'),
                hashlib.sha256
            ).digest()
            expected_signature_b64 = base64.b64encode(expected_signature).decode('utf-8')
            return hmac.compare_digest(signature_from_response, expected_signature_b64)
        except Exception as e:
            print(f"Signature verification error: {e}")
            return False
    
    @classmethod
    def initiate_payment(cls, booking, origin):
        """
        Initiate eSewa 2.0 payment for a booking
        
        Args:
            booking: Booking object
            origin: Frontend origin (e.g. http://localhost:5173)
            
        Returns:
            Dictionary with payment initiation data
        """
        # Amount in rupees
        amount = int(Decimal(booking.total_price))
        
        # Service charge (2%) and delivery charge (0%)
        service_charge = int(amount * 0.02)
        delivery_charge = 0
        
        # Grand total
        total_amount = amount + service_charge + delivery_charge
        
        # Generate reference ID
        from time import time
        ref_id = f"booking_{booking.id}_{int(time())}"
        
        # Prepare and generate signature
        signature_data = {
            'amount': str(amount),
            'scd': cls.ESEWA_MERCHANT_CODE,
            'refId': ref_id,
        }
        signature = cls.generate_signature(signature_data, cls.ESEWA_SECRET_KEY)
        
        # Store transaction reference
        booking.esewa_ref_id = ref_id
        booking.esewa_signature = signature
        booking.save()
        
        return {
            'amt': str(amount),                                 # Amount (rupees)
            'psc': str(service_charge),                         # Service charge
            'pdc': str(delivery_charge),                        # Delivery charge
            'txAmt': '0',                                       # Tax
            'tAmt': str(total_amount),                          # Grand total
            'pid': str(booking.id),                             # Booking ID
            'scd': cls.ESEWA_MERCHANT_CODE,                     # Merchant code
            'refId': ref_id,                                    # Reference ID
            'signature': signature,                             # HMAC signature
            'formUrl': cls.get_form_url(),                      # eSewa form URL
            'su': f"{origin}/payment-success/{booking.id}",     # Success URL
            'fu': f"{origin}/payment-failed/{booking.id}",      # Failure URL
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
            
            # Step 2: Verify with eSewa server (only in production mode)
            if not cls.is_sandbox():
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
                'status': 'COMPLETE',
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
            verification_payload = {
                'amount': response_data.get('amount'),
                'scd': response_data.get('scd'),
                'refId': response_data.get('refId'),
                'oid': response_data.get('oid'),
            }
            
            response = requests.post(
                cls.get_verify_url(),
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


def create_esewa_payment_link(booking, origin):
    """
    Create eSewa payment data with all required parameters
    
    Args:
        booking: Booking object
        origin: Frontend origin (e.g. http://localhost:5173)
        
    Returns:
        Payment data dictionary ready for form submission
    """
    service = EsewaPaymentService()
    return service.initiate_payment(booking, origin)
