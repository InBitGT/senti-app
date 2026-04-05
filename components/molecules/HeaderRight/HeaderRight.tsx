import { HStack } from '@/components/ui/hstack'
import { useProfile } from '@/src/hooks'
import { useAuthStore } from '@/src/store'
import { router } from 'expo-router'
import { Building2, Settings } from 'lucide-react-native'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export const HeaderRight = ({name}:{name:string}) => {
    const { userInfo } = useProfile()
      const claims = useAuthStore.getState().claims;
    
      const pressBtn = ()=>{
        if(!claims?.sub)return
        userInfo.mutate(claims.sub)
        router.navigate("/(drawer)/profile")
      }
  return (
     <HStack style={{ alignItems: 'center', gap: 12, marginRight: 8 }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#f3f3f0',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
      }}>
        <Building2 size={16} color="#534AB7" />
        <Text style={{ fontSize: 13, fontWeight: '500', color: '#1a1a1a' }}>
          {name ?? 'Mi Empresa'}
        </Text>
      </View>

      <TouchableOpacity
        onPress={pressBtn}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        activeOpacity={0.6}
      >
        <Settings size={20} color="#666" />
      </TouchableOpacity>
    </HStack>
  )
}

