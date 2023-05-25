# TODO

1. Refactor codes in async manner

- Map the selection array to await processScreenshots(), drawResult()
- Close the plugin when all the promises end
  > - get byte from figma api problem: One possibility is that plugin just get closed before every promises resolved.

2. Image problem (naver example)

- duplicated header sending problem

3. Error message review
4. font size auto
5. fix the view blinks by external css loading
6. check if all the promises are settled before closing
7. Fetching uint8array
