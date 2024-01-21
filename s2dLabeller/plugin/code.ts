const classes = ['RECTANGLE', 'IMAGE', 'ELLIPSE', 'VECTOR', 'OTHER']

const getClassName = (node: BaseNode) => {
  switch (node.type) {
    case 'RECTANGLE':
      if (node.fills !== figma.mixed) {
        for (const fill of node.fills) {
          if (fill.type === 'IMAGE') {
            return 'IMAGE'
          }
        }
      }
      return 'RECTANGLE'

    case 'COMPONENT':
    case 'INSTANCE':
    case 'FRAME':
      if (node.fills !== figma.mixed) {
        for (const fill of node.fills) {
          if (fill.type === 'IMAGE') {
            return 'IMAGE'
          } else if (fill.type === 'SOLID') {
            return 'RECTANGLE'
          }
        }
      }
      break

    case 'ELLIPSE':
      return 'ELLIPSE'

    case 'VECTOR':
      return 'VECTOR'

    default:
      break
  }
}

const isInClass = (className: string | undefined) => {
  if (!className) {
    return false
  }
  return classes.includes(className)
}

async function main() {
  const frames = figma.currentPage.selection
  frames[0].type

  for (const frame of frames) {
    if (frame.type !== 'FRAME') {
      continue
    }

    console.log(frame.name, 'started')

    const nodes = frame.findAll((n) => isInClass(getClassName(n)))

    console.log(nodes.length, 'nodes found')

    for (const node of nodes) {
      const bytes = await node.exportAsync({
        format: 'JPG',
        contentsOnly: false,
        useAbsoluteBounds: true,
      })

      const body = {
        label: getClassName(node),
        bytes: Array.from(bytes),
      }

      const response = await fetch('http://localhost:3000', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch((error) => {
        console.error(error)
      })

      if (!response) {
        console.error('No response')
        continue
      }

      switch (response.status) {
        case 200:
          console.log(`${frame.name} - ${node.name}| OK!`)
          break

        default:
          console.log(
            `${frame.name} - ${node.name}| ${
              response.status
            }: ${await response.text()}`
          )
          break
      }
    }
  }

  figma.closePlugin('DONE🧊')
}

main()
