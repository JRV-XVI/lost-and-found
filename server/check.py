from RPi import GPIO
from mfrc522 import SimpleMFRC522
from RPLCD.gpio import CharLCD
import mysql.connector
from time import sleep
import sys
from db_config import db_config

# Configuración del LCD con RPLCD
lcd = CharLCD(
    numbering_mode=GPIO.BCM,   # Usa numeración BCM
    cols=16,                   # Número de columnas
    rows=2,                    # Número de filas
    pin_rs=16,                 # GPIO para RS
    pin_rw=None,               # RW conectado a GND
    pin_e=20,                  # GPIO para Enable
    pins_data=[12, 26, 13, 5], # GPIO para D4, D5, D6, D7
    compat_mode=True           # Modo compatible con HD44780
)

# Configuración de los pines GPIO para los LEDs
LEDR = 17  # Ejemplo de pin para LED rojo
LEDG = 27  # Ejemplo de pin para LED verde

# Configuración de los pines GPIO para los LEDs
GPIO.setmode(GPIO.BCM)  # Usa numeración BCM
GPIO.setup(LEDR, GPIO.OUT)  # Configurar LED rojo como salida
GPIO.setup(LEDG, GPIO.OUT)  # Configurar LED verde como salida

# Configuración del lector RFID
reader = SimpleMFRC522()

# NOTA: La configuración de la base de datos ahora se carga desde db_config.py
# que a su vez lee las credenciales del archivo .env

# Función para mostrar mensajes en el LCD
def show_message(message):
    lcd.clear()
    lcd.write_string(message)
    sleep(1)

# Función principal
def main():
    try:
        # Inicialización del LCD
        lcd.clear()
        GPIO.output(LEDR, GPIO.HIGH)  # Enciende LED rojo
        show_message("Esperando tarjeta")

        # Conectar a la base de datos
        db = mysql.connector.connect(**db_config)
        cursor = db.cursor(dictionary=True)

        # Leer la tarjeta RFID
        card_id, _ = reader.read()
        GPIO.output(LEDR, GPIO.LOW)  # Apaga LED rojo
        show_message("Tarjeta leída")
        GPIO.output(LEDG, GPIO.HIGH)  # Enciende LED verde
        print(f"ID leído: {card_id}")
        sleep(1)
        GPIO.output(LEDG, GPIO.LOW)  # Apaga LED verde
        GPIO.output(LEDR, GPIO.HIGH)  # Vuelve a encender LED rojo

        # Leer el archivo data.txt
        try:
            with open("data.txt", "r") as file:
                card_id_from_txt = file.readline().strip()  # Primer línea es el card_id
                object_id_from_txt = file.readline().strip()  # Segunda línea es el ID del objeto

                print(f"Card ID: {card_id_from_txt}, Objeto ID: {object_id_from_txt}")
        except FileNotFoundError:
            show_message("Archivo no encontrado")
            return  # Detener el script si el archivo no se encuentra

        # Verificar si el card_id leído existe en la base de datos
        query_user = "SELECT * FROM Users WHERE cardId = %s"
        cursor.execute(query_user, (card_id,))
        user = cursor.fetchone()

        if user:
            # El usuario existe, buscar el objeto
            query_object = "SELECT * FROM Objects WHERE id = %s AND Status = 'perdido'"
            cursor.execute(query_object, (object_id_from_txt,))
            object_to_update = cursor.fetchone()

            if object_to_update:
                # Cambiar el estado del objeto a 'encontrado'
                update_query = "UPDATE Objects SET Status = 'encontrado' WHERE id = %s"
                cursor.execute(update_query, (object_id_from_txt,))
                db.commit()
                show_message("Objeto actualizado")
                print(f"Objeto con ID {object_id_from_txt} marcado como encontrado.")
            else:
                show_message("Objeto no encontrado o no perdido")
        else:
            show_message("Card ID no válido")

        cursor.close()
        db.close()

    except KeyboardInterrupt:
        print("\nSaliendo...")
    finally:
        # Limpiar LCD y GPIO
        lcd.clear()
        GPIO.cleanup()

# Ejecución del programa
if __name__ == "__main__":
    main()

