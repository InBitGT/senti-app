import { Divider } from '@/components/ui/divider'
import { HStack } from '@/components/ui/hstack'
import { VStack } from '@/components/ui/vstack'
import { LogOut } from 'lucide-react-native'
import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { styles } from './FooterDrawer.styles'

interface Props{
    handleLogout: ()=>void;
}

export const FooterDrawer:React.FC<Props> = ({handleLogout}) => {
  return (
    <View style={styles.footer}>
        <Divider style={styles.divider} />
        <Pressable onPress={handleLogout}>
          {({ pressed }) => (
            <HStack
              style={[styles.logoutButton, pressed && styles.logoutPressed]}
            >
              <View style={styles.logoutIconWrapper}>
                <LogOut size={16} color="#910909" strokeWidth={2} />
              </View>
              <VStack style={{ gap: 0 }}>
                <Text style={styles.logoutLabel}>Cerrar sesión</Text>
              </VStack>
            </HStack>
          )}
        </Pressable>
      </View>
  )
}


