import html2canvas from "html2canvas-pro"
import { jsPDF } from "jspdf"

const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297
const DEFAULT_MARGIN_MM = 12

export interface CoverPageData {
  title: string
  subtitle: string
  generatedAt: Date
  identityLines: string[]
}

export interface ReportSection {
  element?: HTMLElement
  getElement?: () => HTMLElement | null
  beforeCapture?: () => void | Promise<void>
  startOnNewPage?: boolean
}

export interface ExportDashboardPdfOptions {
  filePrefix: string
  cover: CoverPageData
  sections: ReportSection[]
  rootElement?: HTMLElement
  marginMm?: number
}

const pad = (value: number) => String(value).padStart(2, "0")

export const createTimestampString = (date: Date = new Date()) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}-${pad(date.getMinutes())}`
}

export const createReportFilename = (prefix: string, date: Date = new Date()) => {
  return `${prefix}-${createTimestampString(date)}.pdf`
}

const waitForImages = async (container: HTMLElement) => {
  const imageNodes = Array.from(container.querySelectorAll("img"))
  await Promise.all(
    imageNodes.map(async (img) => {
      if (img.complete && img.naturalWidth > 0) {
        return
      }

      await new Promise<void>((resolve) => {
        const done = () => {
          img.removeEventListener("load", done)
          img.removeEventListener("error", done)
          resolve()
        }

        img.addEventListener("load", done)
        img.addEventListener("error", done)
      })
    })
  )
}

const settleLayout = async () => {
  if (typeof document !== "undefined" && "fonts" in document) {
    await (document as Document & { fonts: FontFaceSet }).fonts.ready
  }

  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
}

const setCaptureMode = (container: HTMLElement, enabled: boolean) => {
  container.toggleAttribute("data-pdf-capture", enabled)
}

const captureSectionCanvas = async (section: HTMLElement) => {
  await waitForImages(section)
  await settleLayout()

  const sectionRect = section.getBoundingClientRect()
  const captureWidth = Math.max(1, Math.ceil(section.scrollWidth || sectionRect.width))
  const captureHeight = Math.max(1, Math.ceil(section.scrollHeight || sectionRect.height))

  return html2canvas(section, {
    scale: Math.max(1, Math.min(2, window.devicePixelRatio || 1)),
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#ffffff",
    foreignObjectRendering: false,
    imageTimeout: 15000,
    logging: false,
    scrollX: 0,
    scrollY: -window.scrollY,
    windowWidth: Math.max(document.documentElement.clientWidth, captureWidth),
    windowHeight: Math.max(document.documentElement.clientHeight, captureHeight),
  })
}

const addCoverPage = (doc: jsPDF, cover: CoverPageData) => {
  const generatedAt = cover.generatedAt
  const generatedLine = generatedAt.toLocaleString()

  doc.setFillColor(70, 130, 169)
  doc.rect(0, 0, A4_WIDTH_MM, 58, "F")

  doc.setTextColor(246, 244, 235)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(34)
  doc.text(cover.title, DEFAULT_MARGIN_MM, 34)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(14)
  doc.text(cover.subtitle, DEFAULT_MARGIN_MM, 44)

  doc.setDrawColor(70, 130, 169)
  doc.setLineWidth(0.8)
  doc.roundedRect(DEFAULT_MARGIN_MM, 76, A4_WIDTH_MM - DEFAULT_MARGIN_MM * 2, 98, 6, 6)

  doc.setTextColor(31, 63, 86)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text("Report Details", DEFAULT_MARGIN_MM + 8, 90)

  doc.setFont("helvetica", "normal")
  doc.setTextColor(46, 46, 46)
  doc.setFontSize(11)
  doc.text(`Generated: ${generatedLine}`, DEFAULT_MARGIN_MM + 8, 104)

  let y = 116
  cover.identityLines.forEach((line) => {
    doc.text(line, DEFAULT_MARGIN_MM + 8, y)
    y += 10
  })

  doc.setTextColor(90, 90, 90)
  doc.setFontSize(10)
  doc.text("Exported from AuctioHub dashboard", DEFAULT_MARGIN_MM, A4_HEIGHT_MM - 16)
}

const addCanvasWithPagination = (
  doc: jsPDF,
  canvas: HTMLCanvasElement,
  marginMm: number
) => {
  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error("Captured section is empty")
  }

  const usableWidthMm = A4_WIDTH_MM - marginMm * 2
  const usableHeightMm = A4_HEIGHT_MM - marginMm * 2
  const pxPerMm = canvas.width / usableWidthMm
  const pageSlicePx = Math.max(1, Math.floor(usableHeightMm * pxPerMm))

  let sourceY = 0
  let isFirstSlice = true

  while (sourceY < canvas.height) {
    if (!isFirstSlice) {
      doc.addPage("a4", "portrait")
    }

    const sliceHeightPx = Math.min(canvas.height - sourceY, pageSlicePx)

    if (sliceHeightPx <= 0) {
      continue
    }

    const sliceCanvas = document.createElement("canvas")
    sliceCanvas.width = canvas.width
    sliceCanvas.height = sliceHeightPx

    const ctx = sliceCanvas.getContext("2d")
    if (!ctx) {
      throw new Error("Unable to prepare PDF page slice")
    }

    ctx.drawImage(canvas, 0, sourceY, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx)

    const renderedHeightMm = sliceHeightPx / pxPerMm
    const dataUrl = sliceCanvas.toDataURL("image/png")

    doc.addImage(dataUrl, "PNG", marginMm, marginMm, usableWidthMm, renderedHeightMm, undefined, "FAST")

    sourceY += sliceHeightPx
    isFirstSlice = false
  }
}

export const exportDashboardPdf = async (options: ExportDashboardPdfOptions) => {
  if (typeof window === "undefined") {
    throw new Error("PDF export is only available in the browser")
  }

  if (options.sections.length === 0) {
    throw new Error("No sections provided for PDF export")
  }

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true })
  const marginMm = options.marginMm ?? DEFAULT_MARGIN_MM

  addCoverPage(doc, options.cover)
  doc.addPage("a4", "portrait")

  if (options.rootElement) {
    setCaptureMode(options.rootElement, true)
  }

  try {
    let isFirstSection = true

    for (const section of options.sections) {
      if (section.beforeCapture) {
        await section.beforeCapture()
      }

      const targetElement = section.element ?? section.getElement?.()
      if (!targetElement) {
        throw new Error("Export section element is not available")
      }

      if (!isFirstSection || section.startOnNewPage) {
        doc.addPage("a4", "portrait")
      }

      const canvas = await captureSectionCanvas(targetElement)
      addCanvasWithPagination(doc, canvas, marginMm)
      isFirstSection = false
    }
  } finally {
    if (options.rootElement) {
      setCaptureMode(options.rootElement, false)
    }
  }

  doc.save(createReportFilename(options.filePrefix, options.cover.generatedAt))
}
