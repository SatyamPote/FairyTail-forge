"""
setup.py — install FairyTail-Forge as a package.
Usage: pip install -e .
"""
from setuptools import setup, find_packages

setup(
    name="fairytail-forge",
    version="1.0.0",
    description="Fully offline local AI comic generation studio",
    author="FairyTail-Forge",
    packages=find_packages(),
    python_requires=">=3.10",
    install_requires=[
        "PySide6>=6.7.0",
        "httpx>=0.27.0",
        "Pillow>=10.4.0",
        "reportlab>=4.2.0",
        "SQLAlchemy>=2.0.30",
        "requests>=2.32.3",
        "aiofiles>=23.2.1",
    ],
    entry_points={
        "console_scripts": ["fairytail-forge=fairytail.app:run"],
    },
)
