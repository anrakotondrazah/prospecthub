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
  FillCheckbox,
} from '@/components/ui/buttons'
import { TabBar } from '@/components/ui/TabBar'

export default function UIDemoPage() {
  const [checked1, setChecked1] = useState(false)
  const [checked2, setChecked2] = useState(false)
  const [activeTab, setActiveTab] = useState('tab1')

  const tabs = [
    { id: 'tab1', label: 'Dashboard' },
    { id: 'tab2', label: 'Leads' },
    { id: 'tab3', label: 'Tasks' },
    { id: 'tab4', label: 'Settings' },
  ]

  return (
    <div className="p-6 space-y-12 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">UI Components Demo</h1>
        <p className="text-muted-foreground">Systeme de design coherent - animations fluides 250ms</p>
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
            <p className="text-sm text-muted-foreground">Pay (icons rotation)</p>
            <PayButton onClick={() => alert('Pay clicked')}>Payer</PayButton>
          </div>
        </div>
      </section>

      {/* Icon Buttons */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Icon Buttons (tooltip + animation)
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
          Fill Buttons (hover 250ms)
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <FillButton variant="default">Default</FillButton>
          <FillButton variant="success">Confirmer</FillButton>
          <FillButton variant="danger">Supprimer</FillButton>
        </div>
      </section>

      {/* Checkboxes */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Animated Checkboxes
        </h2>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <AnimatedCheckbox
              id="demo-checkbox-1"
              checked={checked1}
              onChange={setChecked1}
            />
            <label htmlFor="demo-checkbox-1" className="text-foreground cursor-pointer">
              SVG Stroke
            </label>
          </div>

          <div className="flex items-center gap-3">
            <FillCheckbox
              id="demo-checkbox-2"
              checked={checked2}
              onChange={setChecked2}
            />
            <label htmlFor="demo-checkbox-2" className="text-foreground cursor-pointer">
              Fill Diagonal
            </label>
          </div>
        </div>
      </section>

      {/* Tab Bar Variants */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Tab Bar (iOS spring animation)
        </h2>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Pill variant (iOS-style)</p>
          <TabBar
            tabs={tabs}
            defaultTab="tab1"
            variant="pill"
            onChange={setActiveTab}
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Underline variant</p>
          <TabBar
            tabs={tabs}
            defaultTab="tab2"
            variant="underline"
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Dot variant (Material)</p>
          <TabBar
            tabs={tabs}
            defaultTab="tab3"
            variant="dot"
          />
        </div>

        <p className="text-sm text-muted-foreground">
          Tab active: <span className="text-foreground font-medium">{activeTab}</span>
        </p>
      </section>

      {/* Hover Effect */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Hover Lift (subtle elevation)
        </h2>
        <div className="flex flex-wrap gap-4">
          <div className="hover-lift p-6 bg-card border border-border rounded-xl cursor-pointer">
            <p className="font-medium text-foreground">Card avec Hover Lift</p>
            <p className="text-sm text-muted-foreground mt-1">Elevation subtile au survol</p>
          </div>

          <div className="hover-lift p-6 bg-card border border-border rounded-xl cursor-pointer">
            <p className="font-medium text-foreground">Autre Card</p>
            <p className="text-sm text-muted-foreground mt-1">Meme effet coherent</p>
          </div>
        </div>
      </section>

      {/* Scrollbar Ghost */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Scrollbar Ghost (apparait au survol)
        </h2>
        <div className="h-40 overflow-y-auto bg-card border border-border rounded-xl p-4 scrollbar-ghost">
          {Array.from({ length: 20 }).map((_, i) => (
            <p key={i} className="text-muted-foreground py-1">
              Ligne {i + 1} - Scrollbar invisible, apparait au survol
            </p>
          ))}
        </div>
      </section>
    </div>
  )
}
