package expo.modules.sentiprinter

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothSocket
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

  // Muchas impresoras térmicas rechazan el socket seguro: se prueba seguro,
  // inseguro y finalmente el canal RFCOMM 1 por reflexión.
  @SuppressLint("MissingPermission")
  private fun connect(device: BluetoothDevice): BluetoothSocket {
    val attempts = listOf<() -> BluetoothSocket>(
      { device.createRfcommSocketToServiceRecord(sppUuid) },
      { device.createInsecureRfcommSocketToServiceRecord(sppUuid) },
      {
        device.javaClass
          .getMethod("createRfcommSocket", Int::class.javaPrimitiveType)
          .invoke(device, 1) as BluetoothSocket
      },
    )
    var last: Exception? = null
    for (make in attempts) {
      val socket = try { make() } catch (e: Exception) { last = e; continue }
      try {
        socket.connect()
        return socket
      } catch (e: Exception) {
        last = e
        runCatching { socket.close() }
      }
    }
    throw Exception("No se pudo conectar: ${last?.message ?: "desconocido"}")
  }

  // Las térmicas aceptan una sola conexión: verificación e impresión no
  // deben abrir sockets al mismo tiempo.
  private val lock = Any()

  @SuppressLint("MissingPermission")
  private fun openSocket(address: String): BluetoothSocket {
    val bt = adapter() ?: throw Exception("Bluetooth no disponible")
    if (!bt.isEnabled) throw Exception("El Bluetooth está apagado")
    val device = bt.getRemoteDevice(address)
    if (device.bondState != BluetoothDevice.BOND_BONDED) {
      throw Exception("La impresora no está emparejada")
    }
    runCatching { bt.cancelDiscovery() }
    return connect(device)
  }

  @SuppressLint("MissingPermission")
  override fun definition() = ModuleDefinition {
    Name("SentiPrinter")

    AsyncFunction("getPairedDevices") {
      val bt = adapter() ?: throw Exception("Bluetooth no disponible")
      bt.bondedDevices.map { mapOf("name" to (it.name ?: ""), "address" to it.address) }
    }

    // Abre y cierra un socket para comprobar que la impresora responde.
    AsyncFunction("checkConnection") { address: String ->
      synchronized(lock) {
        val socket = openSocket(address)
        runCatching { socket.close() }
        Unit
      }
    }

    AsyncFunction("print") { address: String, base64: String ->
      synchronized(lock) {
        val socket = openSocket(address)
        try {
          socket.outputStream.write(Base64.decode(base64, Base64.DEFAULT))
          socket.outputStream.flush()
          Thread.sleep(300)
        } finally {
          runCatching { socket.close() }
        }
      }
    }
  }
}
