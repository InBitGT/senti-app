import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const SkeletonBox = ({ width, height = 13, style }: { width: string | number; height?: number; style?: object }) => {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1,   duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  return (
    <Animated.View
      style={[styles.skeleton, { width, height, opacity }, style]}
    />
  )
}

const ROW_WIDTHS = [
  ['65%', '80%', '55%', '70%', '60%', '75%'],
  ['80%', '60%', '75%', '55%', '70%', '65%'],
  ['55%', '75%', '65%', '80%', '60%', '70%'],
  ['70%', '55%', '80%', '65%', '75%', '55%'],
  ['60%', '70%', '55%', '75%', '65%', '80%'],
]

export const TableSkeleton = () => {
  return (
    <View style={styles.wrapper}>

      {/* Search + Buttons */}
      <View style={styles.topBar}>
        <SkeletonBox width={200} height={36} style={styles.rounded} />
        <View style={styles.row}>
          <SkeletonBox width={90} height={36} style={[styles.rounded, { marginLeft: 10 }]} />
          <SkeletonBox width={90} height={36} style={[styles.rounded, { marginLeft: 10 }]} />
        </View>
      </View>

      {/* Table */}
      <View style={styles.table}>

        {/* Header */}
        <View style={[styles.tableRow, styles.header]}>
          {['70%', '80%', '60%', '75%', '55%', '65%'].map((w, i) => (
            <View key={i} style={styles.cell}>
              <SkeletonBox width={w} height={13} />
            </View>
          ))}
        </View>

        {/* Rows */}
        {ROW_WIDTHS.map((cols, ri) => (
          <View key={ri} style={styles.tableRow}>
            {cols.map((w, ci) => (
              <View key={ci} style={styles.cell}>
                <SkeletonBox width={w} height={13} />
              </View>
            ))}
          </View>
        ))}

        {/* Pagination */}
        <View style={styles.pagination}>
          <SkeletonBox width={80} height={13} />
          <View style={styles.row}>
            {[1, 2, 3, 4].map((i) => (
              <SkeletonBox key={i} width={28} height={28} style={[styles.pageBtn, { marginLeft: 6 }]} />
            ))}
          </View>
        </View>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper:    { flex: 1, paddingHorizontal: 16, paddingVertical: 24 },
  topBar:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  table:      { borderWidth: 0.5, borderColor: '#d4d4d4', borderRadius: 15, overflow: 'hidden' },
  tableRow:   { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#d4d4d4' },
  header:     { backgroundColor: '#fafafa' },
  cell:       { flex: 1, justifyContent: 'center' },
  pagination: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  row:        { flexDirection: 'row', alignItems: 'center' },
  skeleton:   { backgroundColor: '#d4d4d4', borderRadius: 6 },
  rounded:    { borderRadius: 10 },
  pageBtn:    { borderRadius: 6 },
})