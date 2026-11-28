'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PropertyEditor } from '@/components/properties/PropertyEditor'
import { CreatePropertyModal } from '@/components/properties/CreatePropertyModal'
import type { CustomProperty } from '@/components/properties/PropertyField'
import { Loader } from '@/components/ui/Loader'

import type { ReactNode } from 'react'

type EntityType = 'leads' | 'companies' | 'deals' | 'contacts'

const ENTITY_TABS: Array<{ type: EntityType; label: string; icon: ReactNode }> = [
  {
    type: 'leads',
    label: 'Leads',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    type: 'companies',
    label: 'Entreprises',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 21h18" />
        <path d="M9 21V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14" />
        <path d="M3 21V9a2 2 0 0 1 2-2h2v14" />
        <path d="M15 21V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v12" />
      </svg>
    ),
  },
  {
    type: 'deals',
    label: 'Transactions',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    type: 'contacts',
    label: 'Contacts',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
]

export default function PropertiesSettingsPage() {
  const [activeTab, setActiveTab] = useState<EntityType>('leads')
  const [properties, setProperties] = useState<Record<EntityType, CustomProperty[]>>({
    leads: [],
    companies: [],
    deals: [],
    contacts: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [organizationId, setOrganizationId] = useState<number | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Fetch user and organization
  useEffect(() => {
    async function fetchUserData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (profile?.organization_id) {
        setOrganizationId(profile.organization_id)
      }
    }
    fetchUserData()
  }, [])

  // Fetch properties
  useEffect(() => {
    async function fetchProperties() {
      if (!organizationId) return

      setIsLoading(true)
      setError(null)

      try {
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('custom_properties')
          .select('*')
          .eq('organization_id', organizationId)
          .order('display_order', { ascending: true })

        if (fetchError) throw fetchError

        // Group by entity_type
        const grouped: Record<EntityType, CustomProperty[]> = {
          leads: [],
          companies: [],
          deals: [],
          contacts: [],
        }

        data?.forEach((prop: any) => {
          const entityType = prop.entity_type as EntityType
          if (grouped[entityType]) {
            grouped[entityType].push(prop)
          }
        })

        setProperties(grouped)
      } catch (err: any) {
        console.error('Error fetching properties:', err)
        setError(err.message || 'Erreur lors du chargement des proprietes')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperties()
  }, [organizationId])

  const handlePropertyCreated = (newProperty: CustomProperty) => {
    setProperties(prev => ({
      ...prev,
      [newProperty.entity_type]: [...prev[newProperty.entity_type as EntityType], newProperty],
    }))
    setIsCreateModalOpen(false)
  }

  const handlePropertiesChange = (entityType: EntityType, updatedProperties: CustomProperty[]) => {
    setProperties(prev => ({
      ...prev,
      [entityType]: updatedProperties,
    }))
  }

  if (!organizationId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-[#4E525A] mb-2">
          <a href="/settings" className="hover:text-[#0D0F14] transition-colors">
            Paramètres
          </a>
          <span>/</span>
          <span className="text-[#0D0F14]">Proprietes</span>
        </div>
        <h1 className="text-xl lg:text-[23.5px] font-semibold text-[#0D0F14] mb-1">
          Proprietes personnalisées
        </h1>
        <p className="text-sm text-[#4E525A]">
          Creez des champs personnalisés pour vos leads, entreprises, transactions et contacts
        </p>
      </div>

      {/* Entity Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 p-1 bg-[#F5F7F9] rounded-xl">
        {ENTITY_TABS.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setActiveTab(tab.type)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
              ${activeTab === tab.type
                ? 'bg-white text-[#0D0F14] shadow-sm'
                : 'text-[#4E525A] hover:text-[#0D0F14] hover:bg-white/50'
              }
            `}
          >
            <span className={activeTab === tab.type ? 'text-[#0066FF]' : ''}>
              {tab.icon}
            </span>
            {tab.label}
            <span className={`
              px-1.5 py-0.5 text-xs rounded
              ${activeTab === tab.type
                ? 'bg-[#0066FF]/10 text-[#0066FF]'
                : 'bg-[#E8EAED] text-[#9BA0A6]'
              }
            `}>
              {properties[tab.type].length}
            </span>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-[#FDE8E5] border border-[#B42318]/20 rounded-xl flex items-start gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-sm text-[#B42318]">{error}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-12 flex items-center justify-center">
          <Loader size="md" />
        </div>
      ) : (
        <PropertyEditor
          properties={properties[activeTab]}
          entityType={activeTab}
          organizationId={organizationId}
          onCreateProperty={() => setIsCreateModalOpen(true)}
          onPropertiesChange={(updated) => handlePropertiesChange(activeTab, updated)}
        />
      )}

      {/* Create Modal */}
      <CreatePropertyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPropertyCreated={handlePropertyCreated}
        organizationId={organizationId}
        entityType={activeTab}
        existingFieldNames={properties[activeTab].map(p => p.field_name)}
      />
    </div>
  )
}
