import React from 'react'
import { motion } from 'framer-motion'

const variants = {
  fadeUp:  { hidden: { opacity: 0, y: 20 },       visible: { opacity: 1, y: 0 } },
  fadeIn:  { hidden: { opacity: 0 },               visible: { opacity: 1 }       },
  scaleIn: { hidden: { opacity: 0, scale: 0.96 },  visible: { opacity: 1, scale: 1 } },
  slideLeft: { hidden: { opacity: 0, x: -20 },     visible: { opacity: 1, x: 0 } },
}

export default function AnimatedCard({
  children, variant = 'fadeUp', delay = 0, className = '', hover = false, ...rest
}) {
  return (
    <motion.div
      variants={variants[variant]}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -3, transition: { duration: 0.2 } } : undefined}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export function StaggerContainer({ children, className = '', staggerDelay = 0.07 }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: staggerDelay } } }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = '' }) {
  return (
    <motion.div
      variants={variants.fadeUp}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
