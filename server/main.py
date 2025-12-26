from RPi import GPIO
from mfrc522 import SimpleMFRC522
from RPLCD.gpio import CharLCD
import mysql.connector
from time import sleep
from db_config import db_config

GPIO.setwarnings(False)
# Configuración del LCD
lcd = CharLCD(
    numbering_mode=GPIO.BCM,   # Usa numeración BCM
    cols=16,                  # Número de columnas
    rows=2,                   # Número de filas
    pin_rs=16,                # GPIO para RS
    pin_rw=None,              # RW conectado a GND
    pin_e=20,                 # GPIO para Enable
    pins_data=[12, 26, 13, 5],  # GPIO para D4, D5, D6, D7
    compat_mode=True          # Modo compatible con HD44780
)

LEDR = 27
GPIO.setup(LEDR, GPIO.OUT)
LEDG = 17
GPIO.setup(LEDG, GPIO.OUT)

# Configuración del lector RFID
reader = SimpleMFRC522()

# NOTA: La configuración de la base de datos ahora se importa desde db_config.py
# que lee las credenciales del archivo .env de forma segura

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
        GPIO.output(LEDR, GPIO.HIGH)
        show_message("Esperando tarjeta")



        while True:
           # Conectar a la base de datos
            db = mysql.connector.connect(**db_config)
            cursor = db.cursor(dictionary=True)
            # Leer la tarjeta RFID
            id, _ = reader.read()
            GPIO.output(LEDR, GPIO.LOW)
            show_message("Tarjeta leida")
            GPIO.output(LEDG, GPIO.HIGH)
            print(f"ID leído: {id}")
            sleep(1)
            GPIO.output(LEDG, GPIO.LOW)
            GPIO.output(LEDR, GPIO.HIGH)
            # Consultar en la base de datos
            query_user = "SELECT Matricula, Name FROM Users WHERE cardId = %s"
            cursor.execute(query_user, (id,))
            user = cursor.fetchone()

            if user:
                matricula = user['Matricula']
                name = user['Name']

                # Consultar objetos perdidos
                query_objects = "SELECT id, Name FROM Objects WHERE Matricula = %s AND Status = 'perdido'"
                cursor.execute(query_objects, (matricula,))
                lost_objects = cursor.fetchall()

                if lost_objects:
                    # Escribir objetos perdidos en el archivo data.txt
                    with open("data.txt", "w") as file:
                        for obj in lost_objects:
                            file.write(f"ID: {obj['id']}, Nombre: {obj['Name']}\n")

                    show_message(f"Objetos perdidosID:{obj['id']} Tag: {obj['Name']}")
                else:
                    show_message("No tiene objetos perdidos")
            else:
                show_message("Tarjeta no en sistema")
    except KeyboardInterrupt:
        print("\nSaliendo...")
    finally:
        # Limpiar LCD y GPIO
        lcd.clear()
        GPIO.cleanup()
        cursor.close()
        db.close()

# Ejecución del programa
if __name__ == "__main__":
    main()

