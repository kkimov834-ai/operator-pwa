import { useState, useRef, useEffect } from "react"
import { rmmService } from "../../services/rmm.service"

const Terminal = ({ className }) => {
  const [agentId, setAgentId] = useState("")
  const [agentIdConfirmed, setAgentIdConfirmed] = useState(false)
  const [agentIdInput, setAgentIdInput] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [history, setHistory] = useState([])
  const [isWaiting, setIsWaiting] = useState(false)
  const [commandHistory, setCommandHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const scrollAreaRef = useRef(null)
  const inputRef = useRef(null)
  const pollingRef = useRef(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [history, isWaiting])

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }

  const startPolling = () => {
    stopPolling()
    const startTime = Date.now()

    pollingRef.current = setInterval(async () => {
      if (Date.now() - startTime > 60000) {
        stopPolling()
        setIsWaiting(false)
        setHistory(prev => [...prev, { type: "error", text: "Taym-aut: Agent 60 saniyə ərzində cavab vermədi." }])
        return
      }
      try {
        const res = await rmmService.getResult(agentId)
        if (res.status === 204) return
        stopPolling()
        setIsWaiting(false)
        const data = res.data
        setHistory(prev => [...prev, {
          type: "response",
          text: (typeof data === 'object' ? (data.data || data.output || JSON.stringify(data)) : data) || "(boş cavab)"
        }])
      } catch (err) {
        stopPolling()
        setIsWaiting(false)
        setHistory(prev => [...prev, { type: "error", text: "Xəta: " + (err.response?.data?.message || err.message) }])
      }
    }, 2000)
  }

  const sendCommand = async (command) => {
    setIsWaiting(true)
    try {
      const res = await rmmService.sendCommand(agentId, command)
      if (res.status !== 200 && res.status !== 201) throw new Error(`Server xətası: ${res.status}`)
      startPolling()
    } catch (err) {
      setIsWaiting(false)
      setHistory(prev => [...prev, { type: "error", text: "Xəta: " + (err.response?.data?.message || err.message || "Komanda göndərilmədi.") }])
    }
  }

  const disconnect = () => {
    stopPolling()
    setAgentIdConfirmed(false)
    setAgentId("")
    setAgentIdInput("")
    setHistory([])
    setInputValue("")
  }

  const handleAgentIdKeyDown = (e) => {
    if (e.key !== "Enter") return
    e.preventDefault()
    const id = agentIdInput.trim()
    if (id.length !== 4 || isNaN(id)) {
      setHistory([{ type: "error", text: "Agent ID 4 rəqəmli olmalıdır." }])
      return
    }
    setAgentId(id)
    setAgentIdConfirmed(true)
    setHistory([{ type: "system", text: `Agent #${id} ilə əlaqə quruldu. Komanda daxil edin.` }])
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleCommandKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const command = inputValue.trim()
      if (!command) return
      if (command.toLowerCase() === "clear") {
        setHistory([{ type: "system", text: `Agent #${agentId} ilə əlaqə quruldu. Komanda daxil edin.` }])
        setInputValue("")
        return
      }
      if (command.toLowerCase() === "disconnect") { disconnect(); return }
      setHistory(prev => [...prev, { type: "command", text: `$ ${command}` }])
      setCommandHistory(prev => [command, ...prev])
      setHistoryIndex(-1)
      setInputValue("")
      sendCommand(command)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (historyIndex < commandHistory.length - 1) {
        const next = historyIndex + 1
        setHistoryIndex(next)
        setInputValue(commandHistory[next])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const next = historyIndex - 1
        setHistoryIndex(next)
        setInputValue(commandHistory[next])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInputValue("")
      }
    }
  }

  useEffect(() => () => stopPolling(), [])

  const inputClass = "bg-transparent border-none outline-none flex-1 p-0 min-w-0"

  return (
    <div
      className={("h-[200px] w-full rounded-xl border border-border bg-terminal-bg/90 flex flex-col backdrop-blur-md", className)}
      onClick={() => agentIdConfirmed ? inputRef.current?.focus() : document.getElementById("agent-id-input")?.focus()}
    >
      <div className="flex items-center justify-between border-b border-white/10 p-3 shrink-0 bg-white/5">
        <div className="flex gap-x-2">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs font-mono text-white/40 uppercase tracking-widest">
          {agentIdConfirmed ? `RMM — Agent #${agentId}` : "RMM Terminal"}
        </span>
        {agentIdConfirmed ? (
          <button
            className="text-xs font-mono text-terminal-error/60 hover:text-terminal-error uppercase tracking-widest"
            onClick={(e) => { e.stopPropagation(); disconnect() }}
          >
            disconnect
          </button>
        ) : <div />}
      </div>

      <div ref={scrollAreaRef} className="p-4 overflow-y-auto flex-1 font-mono text-xs md:text-sm">
        <div className="grid gap-y-1.5">
          {history.map((item, i) => (
            <div key={i} className={cn(
              "leading-relaxed whitespace-pre-wrap",
              item.type === "command"  && "text-terminal-prompt font-bold",
              item.type === "response" && "text-terminal-text",
              item.type === "system"   && "text-terminal-system italic",
              item.type === "error"    && "text-terminal-error",
            )}>
              {item.text}
            </div>
          ))}

          {isWaiting && (
            <div className="flex items-center gap-2 text-muted-foreground italic">
              <span className="h-1 w-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="h-1 w-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="h-1 w-1 bg-muted-foreground rounded-full animate-bounce" />
              Agentin cavabı gözlənilir...
            </div>
          )}

          {!agentIdConfirmed && !isWaiting && (
            <div className="flex items-center gap-x-2 pt-1">
              <span className="text-terminal-system shrink-0 font-bold">agent-id:</span>
              <input
                id="agent-id-input"
                type="text"
                maxLength={4}
                value={agentIdInput}
                onChange={(e) => setAgentIdInput(e.target.value.replace(/\D/g, ""))}
                onKeyDown={handleAgentIdKeyDown}
                className={(inputClass, "text-terminal-text caret-terminal-system")}
                autoFocus
                autoComplete="off"
                placeholder="XXXX"
              />
            </div>
          )}

          {agentIdConfirmed && !isWaiting && (
            <div className="flex items-center gap-x-2 pt-1">
              <span className="text-terminal-prompt shrink-0 font-bold">$</span>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleCommandKeyDown}
                className={cn(inputClass, "text-terminal-text caret-terminal-prompt")}
                autoComplete="off"
                spellCheck="false"
              />
            </div>
          )}

          <div className="h-4" />
        </div>
      </div>
    </div>
  )
}

export default Terminal