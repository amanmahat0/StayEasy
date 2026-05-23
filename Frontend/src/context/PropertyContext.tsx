import { createContext, useContext, useState, useCallback } from 'react';
import { getLandlordProperties } from '../services/api';

interface Property {
  id: number;
  title: string;
  property_type: string;
  address?: string;
  city?: string;
  price: number;
  available: boolean;
  status?: string;
  images?: any[];
  main_image?: string;
  created_at?: string;
  has_confirmed_booking?: boolean;
}

interface PropertyContextType {
  properties: Property[];
  loading: boolean;
  fetchProperties: () => Promise<void>;
  refreshProperties: () => Promise<void>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider = ({ children }: { children: React.ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getLandlordProperties();
      setProperties(Array.isArray(data) ? data : data?.results || []);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProperties = useCallback(async () => {
    await fetchProperties();
  }, [fetchProperties]);

  return (
    <PropertyContext.Provider
      value={{
        properties,
        loading,
        fetchProperties,
        refreshProperties,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperties = () => {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperties must be used within a PropertyProvider');
  }
  return context;
};
