import React, { useRef, useState } from "react"

const SERVER = `https://meowfacts.herokuapp.com/?count=`

export default function GetDogFacts() {
  const numberRef = useRef<HTMLInputElement>(null)
  const [number, setNumber] = useState("0")
  const [fact, setFact] = useState("No Response.")
  
  const enroll = async () => {
    if (numberRef.current !== null) {
      setNumber(numberRef.current.value)
      const response = await fetch(`${SERVER}${number}`)
      const result = await response.json()
      
      console.log(result);
      
      setFact(result.data[0])
    }
  }
  
  return (
    <>
    <div>
      <h5>number</h5>
      <input type="text" ref={numberRef} />
      <button onClick={enroll}>Enroll</button>
    </div>
    <h1>{fact}</h1>
    </>
  )
}