import { Button, ButtonText } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Modal, ModalBackdrop, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal'
import { Text } from '@/components/ui/text'
import React from 'react'

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModalDelete: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent style={{ backgroundColor: '#fff' }}>
        <ModalHeader>
          <Heading size="lg" style={{ color: '#000' }}>Confirmar eliminación</Heading>
        </ModalHeader>
        <ModalBody>
          <Text style={{ color: '#000' }}>
            ¿Estás seguro de que deseas eliminar este registro?
            Esta acción no se puede deshacer.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" size="sm" onPress={onClose}>
            <ButtonText style={{color:"#d4d4d4"}} >Cancelar</ButtonText>
          </Button>
          <Button
            size="sm"
            style={{ marginLeft: 10, backgroundColor: '#dc2626' }}
            onPress={onSuccess}
          >
            <ButtonText style={{ color: '#fff' }}>Eliminar</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}