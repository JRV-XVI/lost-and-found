from RPLCD.gpio import CharLCD
from RPi import GPIO
from time import sleep

GPIO.setwarnings(False)
# Configuración de pines del LCD (rs, en, d4, d5, d6, d7)
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

def setup():
    # Inicialización del LCD
    lcd.clear()
    lcd.write_string("Hello, world!")  # Escribe el mensaje inicial
    print("Hola mundo")

# Código principal:
try:
    setup()  # Ejecuta la inicialización
    # Mantén el mensaje visible en un bucle infinito
    while True:
        sleep(1)  # Espera para evitar alto uso de CPU
except KeyboardInterrupt:
    # Permite salir del script con Ctrl+C
    print("\nSaliendo...")
finally:
    lcd.clear()   # Limpia el LCD al terminar
    GPIO.cleanup()  # Libera los pines GPIO
