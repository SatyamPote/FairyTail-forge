import sys
print("Python version:", sys.version)
try:
    import PySide6
    print("PySide6 version:", PySide6.__version__)
    from PySide6.QtWidgets import QApplication, QLabel
    print("PySide6 imports successful!")
except Exception as e:
    print("Error importing PySide6:", e)
