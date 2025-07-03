[![schulte-development.de | Build, deploy to GitHubPage on main](https://github.com/SchulteDev/SchulteDev/actions/workflows/schulte-development-de_build-deploy.yml/badge.svg)](https://github.com/SchulteDev/SchulteDev/actions/workflows/schulte-development-de_build-deploy.yml)

# schulte-development.de homepage

Source of [schulte-development.de](https://schulte-development.de).

The homepage https://schulte-development.de is used for marketing by Markus Schulte / Schulte
development. Markus is a freelancer and presents his knowledge and experience on his professional
website.

## 🛠️ Tech Stack

- [Jekyll](https://jekyllrb.com) static site generator
  - [Beautiful-Jekyll](https://beautifuljekyll.com) as the Jekyll theme
- [GitHub Pages](https://pages.github.com/) hosting
- Docker for development
- Automated CI/CD workflows

## Setup

### Option 1: Native Installation

1. Follow [Jekyll installation instructions](https://jekyllrb.com/docs/#instructions)
2. `$ make`

### Option 2: Docker

    $ docker-compose up --build
