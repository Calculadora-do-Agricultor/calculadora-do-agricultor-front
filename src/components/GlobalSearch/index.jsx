import React, { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search as SearchIcon, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { db } from "@/services/firebaseConfig"
import { faqService } from "@/services/faqService"
import { collection, getDocs } from "firebase/firestore"

function GlobalSearch({ user }) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [calculations, setCalculations] = useState([])
  const [categories, setCategories] = useState([])
  const [faqItems, setFaqItems] = useState([])
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const loadData = async () => {
    try {
      setLoading(true)
      const promises = []
      promises.push(faqService.getActiveFAQItems())
      if (user) {
        promises.push(getDocs(collection(db, "calculations")))
        promises.push(getDocs(collection(db, "categories")))
      }
      const results = await Promise.all(promises)
      const faqRes = results[0] || []
      setFaqItems(Array.isArray(faqRes) ? faqRes : [])
      if (user) {
        const calcSnap = results[1]
        const catSnap = results[2]
        setCalculations(
          calcSnap?.docs.map((doc) => ({ id: doc.id, ...doc.data() })) || []
        )
        setCategories(
          catSnap?.docs.map((doc) => ({ id: doc.id, ...doc.data() })) || []
        )
      } else {
        setCalculations([])
        setCategories([])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matchText = (t) => (t || "").toLowerCase().includes(q)
    const byWeight = (a, b) => (b.weight || 0) - (a.weight || 0)
    const items = []
    if (q.length) {
      categories.slice(0, 200).forEach((cat) => {
        if (matchText(cat.name)) {
          items.push({
            type: "category",
            id: cat.id,
            title: cat.name,
            subtitle: "Categoria",
            weight: 3,
            data: cat,
          })
        }
      })
      calculations.slice(0, 500).forEach((calc) => {
        const name = calc.name || calc.nome || ""
        const desc = calc.description || calc.descricao || ""
        const tags = Array.isArray(calc.tags) ? calc.tags.join(" ") : ""
        const score = (matchText(name) ? 3 : 0) + (matchText(tags) ? 2 : 0) + (matchText(desc) ? 1 : 0)
        if (score > 0) {
          items.push({
            type: "calculation",
            id: calc.id,
            title: name,
            subtitle: "Cálculo",
            weight: score,
            data: calc,
          })
        }
      })
      faqItems.slice(0, 500).forEach((item) => {
        const inQ = matchText(item.question)
        const inA = matchText(item.answer)
        const inT = (item.tags || []).some((t) => matchText(t))
        const score = (inQ ? 3 : 0) + (inT ? 2 : 0) + (inA ? 1 : 0)
        if (score > 0) {
          items.push({
            type: "faq",
            id: item.id,
            title: item.question,
            subtitle: "FAQ",
            weight: score,
            data: item,
          })
        }
      })
    }
    return items.sort(byWeight).slice(0, 18)
  }, [query, categories, calculations, faqItems])

  const handleSelect = (item) => {
    if (!item) return
    if (item.type === "category") {
      const name = item.data?.name || item.title
      navigate(`/calculator?category=${encodeURIComponent(name)}`)
    } else if (item.type === "calculation") {
      const id = item.id
      const cats = Array.isArray(item?.data?.categories) ? item.data.categories : []
      const firstCatId = cats.length ? cats[0] : null
      const qs = new URLSearchParams()
      qs.set("calculationId", id)
      if (firstCatId) qs.set("categoryId", firstCatId)
      navigate(`/calculator?${qs.toString()}`)
    } else if (item.type === "faq") {
      const term = item.title || query
      navigate(`/faq?q=${encodeURIComponent(term)}`)
    }
    setOpen(false)
    setQuery("")
  }

  const onKeyDown = (e) => {
    if (!open) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      if (highlightIndex >= 0 && highlightIndex < filtered.length) {
        e.preventDefault()
        handleSelect(filtered[highlightIndex])
      }
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div className="relative w-64 lg:w-80">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (!open) setOpen(true)
            }}
            onFocus={() => {
              setOpen(true)
              if (!faqItems.length || (user && (!calculations.length || !categories.length))) {
                loadData()
              }
            }}
            onBlur={() => {
              setOpen(false)
              setHighlightIndex(-1)
            }}
            onKeyDown={onKeyDown}
            placeholder="Buscar cálculos, categorias e FAQ"
            className="pl-7 text-white placeholder:text-white/70 border-white/40 focus-visible:border-white/70"
          />
        </div>
      </div>
      {open && (
        <div className="absolute left-0 right-0 mt-2 z-50 rounded-md border bg-white shadow-lg">
          {loading ? (
            <div className="flex items-center justify-center p-4 text-gray-700">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Carregando...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-3 text-sm text-gray-600">Nenhuma sugestão</div>
          ) : (
            <ScrollArea className="max-h-80">
              <ul role="listbox" aria-label="Sugestões" className="py-1">
                {filtered.map((item, idx) => (
                  <li
                    key={`${item.type}-${item.id}`}
                    role="option"
                    aria-selected={idx === highlightIndex}
                    onMouseEnter={() => setHighlightIndex(idx)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(item)}
                    className={`px-3 py-2 cursor-pointer ${idx === highlightIndex ? "bg-gray-100" : ""}`}
                  >
                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.subtitle}</div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  )
}

export default GlobalSearch
