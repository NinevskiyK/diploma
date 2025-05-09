from setuptools import setup, find_packages
import os

def read_requirements():
    requirements_path = os.path.join(os.path.dirname(__file__), 'requirements.txt')
    requirements = []
    try:
        with open(requirements_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    requirements.append(line)
    except FileNotFoundError:
        print("Warning: requirements.txt not found, no dependencies will be installed.")
    return requirements

setup(
    name="load_testing_sim",
    version="0.1.0",
    packages=find_packages(),
    install_requires=read_requirements(),
    author="Your Name",
    author_email="your.email@example.com",
    description="Simulation package for system configuration",
)