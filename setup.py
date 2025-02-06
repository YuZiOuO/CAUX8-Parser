from setuptools import setup, find_packages
setup(
    name="caux8_moodle_parser",
    version="1.0.0",
    author="YuZiOuO & zxy-daiz",
    author_email="cyz050312@gmail.com",
    description="Parser for converting a moodle-question-like python object to moodle xml format.",
    long_description=open("README.md",encoding="utf-8").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/YuZiOuO/CAUX8-Parser",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.10",
)