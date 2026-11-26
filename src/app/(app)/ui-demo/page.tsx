'use client'

import { useState } from 'react'
import {
  LogoutButton,
  SaveButton,
  DownloadButton,
  UploadButton,
  PayButton,
  FillButton,
  AnimatedCheckbox,
} from '@/components/ui/buttons'
import { TabBar } from '@/components/ui/TabBar'

export default function UIDemoPage() {
  const [checked, setChecked] = useState(false)
  const [activeTab, setActiveTab] = useState('tab1')

  const tabs = [
    { id: 'tab1', label: 'Dashboard' },
    { id: 'tab2', label: 'Leads' },
    { id: 'tab3', label: 'Tasks' },
    { id: 'tab4', label: 'Settings' },
  ]

  return (
    <div className="p-6 space-y-12">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">UI Components Demo</h1>
        <p className="text-muted-foreground">Systeme de design coherent avec animations fluides</p>
      </div>

      {/* Action Buttons */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Action Buttons
        </h2>
        <div className="flex flex-wrap items-center gap-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Logout (expand)</p>
            <LogoutButton onClick={() => alert('Logout clicked')} />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Save (arrow slide)</p>
            <SaveButton onClick={() => alert('Save clicked')}>Enregistrer</SaveButton>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Pay (icon rotate)</p>
            <PayButton onClick={() => alert('Pay clicked')}>Payer</PayButton>
          </div>
        </div>
      </section>

      {/* Icon Buttons */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Icon Buttons (avec tooltip)
        </h2>
        <div className="flex flex-wrap items-center gap-8">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Download</p>
            <DownloadButton tooltip="Telecharger" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Upload</p>
            <UploadButton tooltip="Importer" />
          </div>
        </div>
      </section>

      {/* Fill Buttons */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Fill Buttons (hover effect)
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <FillButton variant="default">Default</FillButton>
          <FillButton variant="success">Confirmer</FillButton>
          <FillButton variant="danger">Supprimer</FillButton>
        </div>
      </section>

      {/* Checkbox */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Animated Checkbox
        </h2>
        <div className="flex items-center gap-3">
          <AnimatedCheckbox
            id="demo-checkbox"
            checked={checked}
            onChange={setChecked}
          />
          <label htmlFor="demo-checkbox" className="text-foreground cursor-pointer">
            {checked ? 'Selectionne' : 'Non selectionne'}
          </label>
        </div>
      </section>

      {/* Tab Bar */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Tab Bar (iOS-style pill)
        </h2>
        <div className="max-w-md">
          <TabBar
            tabs={tabs}
            defaultTab="tab1"
            onChange={setActiveTab}
          />
          <p className="mt-4 text-sm text-muted-foreground">
            Tab active: <span className="text-foreground font-medium">{activeTab}</span>
          </p>
        </div>
      </section>

      {/* Hover Effects Demo */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Hover Effects
        </h2>
        <div className="flex flex-wrap gap-4">
          <div className="hover-lift p-4 bg-card border border-border rounded-xl cursor-pointer">
            <p className="font-medium">Hover Lift</p>
            <p className="text-sm text-muted-foreground">Subtle elevation</p>
          </div>

          <div className="hover-scale p-4 bg-card border border-border rounded-xl cursor-pointer">
            <p className="font-medium">Hover Scale</p>
            <p className="text-sm text-muted-foreground">Slight zoom</p>
          </div>

          <div className="hover-glow p-4 bg-card border border-border rounded-xl cursor-pointer">
            <p className="font-medium">Hover Glow</p>
            <p className="text-sm text-muted-foreground">Accent glow</p>
          </div>
        </div>
      </section>

      {/* Scrollbar Demo */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Modern Scrollbar
        </h2>
        <div className="h-32 overflow-y-auto bg-card border border-border rounded-xl p-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <p key={i} className="text-muted-foreground py-1">
              Ligne {i + 1} - Scrollbar minimaliste et discrete
            </p>
          ))}
        </div>
      </section>
    </div>
  )
}
