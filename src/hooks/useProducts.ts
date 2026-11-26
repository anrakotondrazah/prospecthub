'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Product = {
  id: number
  uuid: string
  sku: string | null
  name: string
  description: string | null
  unit_price: number
  currency: string
  unit: string
  tax_rate: number
  category: string | null
  is_recurring: boolean
  billing_frequency: string | null
  is_active: boolean
  image_url: string | null
  created_at: string
}

export function useProducts(organizationId: number | null) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProducts = useCallback(async () => {
    if (!organizationId) return

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setProducts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch products'))
    } finally {
      setIsLoading(false)
    }
  }, [organizationId])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const createProduct = useCallback(async (productData: Omit<Product, 'id' | 'uuid' | 'created_at'>) => {
    if (!organizationId) throw new Error('No organization')

    const supabase = createClient()

    const { data, error } = await supabase
      .from('products')
      .insert({
        organization_id: organizationId,
        ...productData,
      })
      .select('*')
      .single()

    if (error) throw error

    setProducts((prev) => [data, ...prev])
    return data
  }, [organizationId])

  const updateProduct = useCallback(async (id: number, updates: Partial<Product>) => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error

    setProducts((prev) => prev.map((p) => (p.id === id ? data : p)))
    return data
  }, [])

  const deleteProduct = useCallback(async (id: number) => {
    const supabase = createClient()

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error

    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return {
    products,
    isLoading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  }
}
