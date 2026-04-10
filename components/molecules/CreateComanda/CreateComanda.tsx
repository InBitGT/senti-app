import {
    Button,
    ButtonText,
} from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import {
    Modal,
    ModalBackdrop,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from '@/components/ui/modal'
import { Text } from '@/components/ui/text'
import { MenuItem, MenuItemModifier, MenuItemVariant, ModalMenuItemResult } from '@/src/types/menuItem/menuItem.types'
import React, { useEffect, useMemo, useState } from 'react'
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'

interface Props {
  isOpen: boolean
  item: MenuItem | null
  onClose: () => void
  onConfirm: (result: ModalMenuItemResult) => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(amount: number, currency = 'GTQ') {
  return `${currency === 'GTQ' ? 'Q' : currency} ${amount.toFixed(2)}`
}

function calcVariantExtra(variant: MenuItemVariant, base: number): number {
  if (variant.adjustment_type === 'fixed') return variant.price_adjustment
  return (base * variant.price_adjustment) / 100
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>
}

function GridButton({
  label,
  sublabel,
  active,
  onPress,
}: {
  label: string
  sublabel?: string
  active: boolean
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.gridBtn, active && styles.gridBtnActive]}
    >
      <Text style={[styles.gridBtnLabel, active && styles.gridBtnLabelActive]} numberOfLines={2}>
        {label}
      </Text>
      {sublabel ? (
        <Text style={[styles.gridBtnSublabel, active && styles.gridBtnSublabelActive]}>
          {sublabel}
        </Text>
      ) : null}
      {active && <View style={styles.gridBtnCheck} />}
    </TouchableOpacity>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export const ComandaItem: React.FC<Props> = ({ isOpen, item, onClose, onConfirm }) => {
  const [selectedVariant, setSelectedVariant] = useState<MenuItemVariant | null>(null)
  const [selectedModifiers, setSelectedModifiers] = useState<MenuItemModifier[]>([])

  useEffect(() => {
    if (isOpen && item) {
      setSelectedVariant(item.variants.length > 0 ? null : null)
      const defaults = item.modifiers.filter((m) => m.is_default && m.status)
      setSelectedModifiers(defaults)
    }
  }, [isOpen, item])

  const basePrice = item?.price?.amount ?? 0
  const currency = item?.price?.currency ?? 'GTQ'

  const totalPrice = useMemo(() => {
    if (!item) return 0
    let total = basePrice
    if (selectedVariant) total += calcVariantExtra(selectedVariant, basePrice)
    for (const mod of selectedModifiers) total += mod.price_adjustment
    return total
  }, [item, basePrice, selectedVariant, selectedModifiers])

  const hasVariants = (item?.variants ?? []).filter((v) => v.status).length > 0
  const hasModifiers = (item?.modifiers ?? []).filter((m) => m.status).length > 0

  const modifierGroups = useMemo(() => {
    if (!item) return []
    const groups: Record<string, MenuItemModifier[]> = {}
    for (const mod of item.modifiers.filter((m) => m.status)) {
      if (!groups[mod.modifier_group]) groups[mod.modifier_group] = []
      groups[mod.modifier_group].push(mod)
    }
    return Object.entries(groups).map(([group, mods]) => ({ group, mods }))
  }, [item])

  const canConfirm = !hasVariants || selectedVariant !== null

  function toggleModifier(mod: MenuItemModifier) {
    setSelectedModifiers((prev) => {
      const exists = prev.find((m) => m.product_modifier_id === mod.product_modifier_id)
      if (exists) return prev.filter((m) => m.product_modifier_id !== mod.product_modifier_id)
      const inGroup = prev.filter((m) => m.modifier_group === mod.modifier_group)
      if (mod.max_selection > 0 && inGroup.length >= mod.max_selection) {
        const withoutFirst = prev.filter(
          (m) =>
            m.modifier_group !== mod.modifier_group ||
            m.product_modifier_id !== inGroup[0].product_modifier_id,
        )
        return [...withoutFirst, mod]
      }
      return [...prev, mod]
    })
  }

  if (!item) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent style={styles.modalContent}>

        {/* ── Header ── */}
        <ModalHeader style={styles.header}>
          <View style={{ flex: 1 }}>
            <Heading size="md" style={styles.heading}>{item.product.name}</Heading>
            <Text style={styles.sku}>{item.product.sku}</Text>
          </View>
          <View style={styles.priceChip}>
            <Text style={styles.priceChipText}>{formatPrice(totalPrice, currency)}</Text>
          </View>
        </ModalHeader>

        {/* ── Body ── */}
        <ModalBody>
          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Base price */}
            <View style={styles.priceRow}>
              <Text style={styles.priceRowLabel}>Precio base</Text>
              <Text style={styles.priceRowValue}>{formatPrice(basePrice, currency)}</Text>
            </View>

            {/* ── Variants ── */}
            {hasVariants && (
              <View style={styles.section}>
                <SectionLabel>Variante (obligatorio)</SectionLabel>
                <View style={styles.grid}>
                  {item.variants
                    .filter((v) => v.status)
                    .map((v) => {
                      const extra = calcVariantExtra(v, basePrice)
                      const sign = extra >= 0 ? '+' : ''
                      return (
                        <GridButton
                          key={v.id}
                          label={v.name}
                          sublabel={`${sign}${formatPrice(extra, currency)}`}
                          active={selectedVariant?.id === v.id}
                          onPress={() => setSelectedVariant(v)}
                        />
                      )
                    })}
                </View>
              </View>
            )}

            {/* ── Modifiers ── */}
            {hasModifiers && (
              <View style={styles.section}>
                <SectionLabel>Extras (opcional)</SectionLabel>
                {modifierGroups.map(({ group, mods }) => (
                  <View key={group} style={styles.modGroup}>
                    <Text style={styles.modGroupLabel}>{group}</Text>
                    <View style={styles.grid}>
                      {mods.map((mod) => {
                        const active = !!selectedModifiers.find(
                          (m) => m.product_modifier_id === mod.product_modifier_id,
                        )
                        const sign = mod.price_adjustment >= 0 ? '+' : ''
                        return (
                          <GridButton
                            key={mod.product_modifier_id}
                            label={mod.modifier_name}
                            sublabel={
                              mod.price_adjustment !== 0
                                ? `${sign}${formatPrice(mod.price_adjustment, currency)}`
                                : undefined
                            }
                            active={active}
                            onPress={() => toggleModifier(mod)}
                          />
                        )
                      })}
                    </View>
                  </View>
                ))}
              </View>
            )}

          </ScrollView>
        </ModalBody>

        {/* ── Footer ── */}
        <ModalFooter style={styles.footer}>
          {hasVariants && !selectedVariant && (
            <Text style={styles.validationHint}>Elige una variante para continuar</Text>
          )}
          <View style={styles.footerButtons}>
            <Button variant="outline" size="sm" onPress={onClose} style={styles.btnCancel}>
              <ButtonText style={{ color: '#888' }}>Cancelar</ButtonText>
            </Button>
            <Button
              size="sm"
              style={[styles.btnConfirm, !canConfirm && styles.btnDisabled]}
              onPress={() => {
                if (!canConfirm) return
                onConfirm({
                  item,
                  variant: selectedVariant,
                  modifiers: selectedModifiers,
                  totalPrice,
                })
              }}
            >
              <ButtonText style={{ color: '#fff' }}>
                Agregar · {formatPrice(totalPrice, currency)}
              </ButtonText>
            </Button>
          </View>
        </ModalFooter>

      </ModalContent>
    </Modal>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: '90%',
    width: '95%',
    alignSelf: 'center',
    
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  heading: { color: '#1a1a1a' },
  sku: { fontSize: 11, color: '#aaa', marginTop: 2 },
  priceChip: {
    backgroundColor: '#EEEDFE',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  priceChipText: { fontSize: 14, fontWeight: '600', color: '#3C3489' },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
    marginBottom: 12,
  },
  priceRowLabel: { fontSize: 12, color: '#888' },
  priceRowValue: { fontSize: 12, fontWeight: '600', color: '#1a1a1a' },

  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 10,
  },

  // 4-column grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridBtn: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    position: 'relative',
  },
  gridBtnActive: {
    borderColor: '#3C3489',
    backgroundColor: '#EEEDFE',
  },
  gridBtnLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  gridBtnLabelActive: { color: '#3C3489' },
  gridBtnSublabel: {
    fontSize: 10,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 3,
  },
  gridBtnSublabelActive: { color: '#534AB7' },
  gridBtnCheck: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3C3489',
  },

  // Modifier groups
  modGroup: { marginBottom: 14 },
  modGroupLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },

  // Recipe
  recipeBox: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 12,
    borderWidth: 0.5,
    borderColor: '#ebebeb',
  },
  recipeName: { fontSize: 12, fontWeight: '600', color: '#555', marginBottom: 10 },
  ingredientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ingredientChip: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
  },
  ingredientQty: { fontSize: 12, fontWeight: '500', color: '#333' },
  ingredientId: { fontSize: 10, color: '#aaa', marginTop: 1 },

  // Footer
  footer: { flexDirection: 'column', alignItems: 'stretch', gap: 8 },
  validationHint: {
    fontSize: 11,
    color: '#dc2626',
    textAlign: 'center',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  btnCancel: { borderColor: '#e0e0e0' },
  btnConfirm: {
    backgroundColor: '#3C3489',
    flex: 1,
  },
  btnDisabled: {
    backgroundColor: '#c4c2e8',
  },
})