package expo.modules.sentiprinter

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.content.Context
import android.util.Base64
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.UUID

class SentiPrinterModule : Module() {
  private val sppUuid = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")

  private fun adapter(): BluetoothAdapter? {
    val context = appContext.reactContext ?: return null
    val manager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
    return manager.adapter
  }

  @SuppressLint("MissingPermission")
  override fun definition() = ModuleDefinition {
    Name("SentiPrinter")

    AsyncFunction("getPairedDevices") {
      val bt = adapter() ?: throw Exception("Bluetooth no disponible")
      bt.bondedDevices.map { mapOf("name" to (it.name ?: ""), "address" to it.address) }
    }

    AsyncFunction("print") { address: String, base64: String ->
      val bt = adapter() ?: throw Exception("Bluetooth no disponible")
      if (!bt.isEnabled) throw Exception("El Bluetooth está apagado")
      runCatching { bt.cancelDiscovery() }
      val socket = bt.getRemoteDevice(address).createRfcommSocketToServiceRecord(sppUuid)
      try {
        socket.connect()
        socket.outputStream.write(Base64.decode(base64, Base64.DEFAULT))
        socket.outputStream.flush()
        Thread.sleep(300)
      } finally {
        socket.close()
      }
    }
  }
}
