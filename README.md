# screenshot2design

## Figma plugin converting screenshots to editable design elements

The image detection model is from UIED by MulongXie.
https://github.com/MulongXie/UIED

If I did something wrong with the license(Apache 2.0), please let me know.

---

## TODO

### Plugin side

1. Refactor codes in async manner

- Map the selection array to await getResultFromServer(), drawResult()
- Close the plugin when all the promises end
  > - get byte from figmaa api problem: One possibility is that plugin just get closed before every promises resolved.

2. Image problem (naver example)
3. Error message

### Server side

1. logging into log file, not console.log -> pino, pino-pretty

### Model side

1. Clean up files

### Webpage side

1. We use the original image, even though you croped the image in Figma.
