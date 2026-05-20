import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AppLayout } from '@/components/layout/AppLayout'
import { HomePage } from '@/pages/HomePage'
import { WorkspacePage } from '@/pages/WorkspacePage'
import { PageView } from '@/pages/PageView'
import { GraphView } from '@/pages/GraphView'

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
}

const pageTransition = { duration: 0.18, ease: 'easeInOut' }

export default function App() {
  const location = useLocation()

  return (
    <AppLayout>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="h-full"
        >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/w/:workspaceId" element={<WorkspacePage />} />
            <Route path="/w/:workspaceId/p/:pageId" element={<PageView />} />
            <Route path="/w/:workspaceId/graph" element={<GraphView />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </AppLayout>
  )
}
