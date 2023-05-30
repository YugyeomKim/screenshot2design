# API

### /data/users

Fields

1. userData

### /data/stat/:metric

Fields

1. type
2. payload?

metric: The name of field that we want to update

- `heart-shake`
- `heart-image-recommander`
- `heart-layout-fixer`

type: The way we want to update

- `increment`: increment by 1
- `decrement`: decrement by 1
- `subfield-increment`: increment subfield by 1
- `subfield-decrement`: decrement subfield by 1

# TODO

1. Security -> helmet
2. set CORS policy

- `auth/enroll`: null, http://localhost:3000, https://s2dlab.framer.website
- `auth/credit`: https://s2dlab.framer.website
- others: null

3. improve status code
4. Get components from python with double quoted properties json directly?

- How to read components not from stdout but json file?

5. js new Date() inconsistency (UTC and lacal time)

# Checklist for publishing

1. Set environment variables.

- NODE_ENV=production

2. Check buffer directory if input and output directory exist
3. python envirionment setting

- pyenv for python3.5
- Opencv 3.4.2
- Pandas
