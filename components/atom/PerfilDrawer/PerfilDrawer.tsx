import { Avatar, AvatarFallbackText } from '@/components/ui/avatar'
import { HStack } from '@/components/ui/hstack'
import { VStack } from '@/components/ui/vstack'
import { useProfile } from '@/src/hooks'
import { useAuthStore } from '@/src/store'
import { getInitials } from '@/src/utils'
import { router } from 'expo-router'
import { Mail } from 'lucide-react-native'
import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { styles } from './PerfilDrawer.styles'

interface Props{
    name?: string;
    email?:string
}

export const PerfilDrawer:React.FC<Props> = ({name, email}) => {
  const { userInfo } = useProfile()
  const claims = useAuthStore.getState().claims;

  const pressBtn = ()=>{
    if(!claims?.sub)return
    userInfo.mutate(claims.sub)
    router.navigate("/(drawer)/profile")
  }

  return (
      <Pressable style={styles.profileSection} onPress={pressBtn}>
        <View style={styles.avatarWrapper}>
          <Avatar style={styles.avatar}>
            <AvatarFallbackText>{getInitials(name ? name : "user")}</AvatarFallbackText>
          </Avatar>
          <View style={styles.onlineDot} />
        </View>

        <VStack style={styles.profileInfo}>
          <Text style={styles.profileName}>{name}</Text>
          <HStack style={styles.profileMeta}>
            <Mail size={11} color="#94a3b8" strokeWidth={2} />
            <Text style={styles.profileEmail}>{email}</Text>
          </HStack>
        </VStack>
      </Pressable>
  )
}

