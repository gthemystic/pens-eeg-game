'use client'

import confetti from 'canvas-confetti'

/**
 * 🎊 The Victory Confetti Cannon - Delivering hits of dopamine in pixelated form
 */
export const VictoryConfetti = {
  /**
   * 🥉 Bronze Burst - A polite ripple of applause
   */
  bronze: () => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7, x: 0.8 },
      colors: ['#cd7f32', '#a0522d', '#ffffff'],
    })
  },

  /**
   * 🥈 Silver Splash - A respectable fountain of achievement
   */
  silver: () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7, x: 0.2 },
      colors: ['#c0c0c0', '#808080', '#ffffff'],
    })
  },

  /**
   * 🥇 Gold Explosion - The grand finale, the supernova of synapses
   */
  gold: () => {
    const duration = 3 * 1000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#ffd700', '#ff8c00', '#ffffff'],
      })
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#ffd700', '#ff8c00', '#ffffff'],
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  },

  /**
   * 🎆 Side Cannons - For when the vibes are just too high
   */
  sideCannons: () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
    })
  }
}
