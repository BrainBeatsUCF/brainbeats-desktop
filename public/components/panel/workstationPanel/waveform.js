import React, { useEffect, useRef } from 'react'

/**
 * @param {{
 * audioData: AudioBuffer
 * width: Number,
 * height: Number,
 * }} props
 */
const WaveForm = props => {
  const canvasRef = useRef(null)

  /**
   * @param {AudioBuffer} audioBuffer
   */
  const filterData = audioBuffer => {
    const rawData = audioBuffer.getChannelData(0) // We only need to work with one channel of data
    const samples = 50 // Number of samples we want to have in our final data set
    const blockSize = Math.floor(rawData.length / samples) // the number of samples in each subdivision
    const filteredData = []

    for (let i = 0; i < samples; i++) {
      let blockStart = blockSize * i // the location of the first sample in the block
      let sum = 0
      for (let j = 0; j < blockSize; j++) {
        sum = sum + Math.abs(rawData[blockStart + j]) // find the sum of all the samples in the block
      }
      filteredData.push(sum / blockSize) // divide the sum by the block size to get the average
    }

    const multiplier = Math.pow(Math.max(...filteredData), -1)
    return filteredData.map(n => n * multiplier)
  }

  const drawLineSegment = (ctx, x, y, width, isEven) => {
    ctx.lineWidth = 1 // how thick the line is
    ctx.strokeStyle = '#fff' // what color our line is
    ctx.beginPath()
    y = isEven ? y : -y
    ctx.moveTo(x, 0)
    ctx.lineTo(x, y)
    ctx.arc(x + width / 2, y, width / 2, Math.PI, 0, isEven)
    ctx.lineTo(x + width, 0)
    ctx.stroke()
  }

  /**
   * @param {number[]} normalizedData
   * @param {HTMLCanvasElement} canvas
   */
  const draw = (normalizedData, canvas) => {
    // Set up the canvas
    const ctx = canvas.getContext('2d')
    // Set Y = 0 to be in the middle of the canvas
    ctx.translate(0, canvas.height / 2)

    // draw the line segments
    const width = canvas.width / normalizedData.length
    for (let i = 0; i < normalizedData.length; i++) {
      const x = width * i
      // Scaled to 60% of the full height to leave padding on edges
      let height = normalizedData[i] * canvas.height * 0.6
      if (height < 0) {
        height = 0
      } else if (height > canvas.height / 2) {
        height = height > canvas.height / 2
      }
      drawLineSegment(ctx, x, height, width, (i + 1) % 2)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const normalizedData = filterData(props.audioData)
    draw(normalizedData, canvas)
  }, [])

  return <canvas ref={canvasRef} height={props.height} width={props.width}></canvas>
}

export { WaveForm }
