class SAT2 {
    constructor(n) { this.clear(n) }
    clear(n) {
        this.n = n
        const N = 2 * n
        this.head = new Int32Array(N + 1)
        this.head.fill(-1)
        this._cap = 4
        this.to = new Int32Array(this._cap + 1)
        this.next = new Int32Array(this._cap + 1)
        this.ei = 0
    }
    _grow() {
        const nc = this._cap << 1
        const to2 = new Int32Array(nc + 1)
        const nx2 = new Int32Array(nc + 1)
        to2.set(this.to)
        nx2.set(this.next)
        this._cap = nc
        this.to = to2
        this.next = nx2
    }
    _addEdge(u, v) {
        if (++this.ei > this._cap) this._grow()
        this.to[this.ei] = v
        this.next[this.ei] = this.head[u]
        this.head[u] = this.ei
    }
    _map(v) { return (v > 0) ? v : (-v + this.n) }
    _neg(u) { return (u > this.n) ? (u - this.n) : (u + this.n) }
    add(a, b) {
        const A = this._map(a), B = this._map(b)
        const nA = this._neg(A), nB = this._neg(B)
        this._addEdge(nA, B)
        this._addEdge(nB, A)
    }
    make1(x) { this.add(+x, +x) }
    make0(x) { this.add(-x, -x) }
    m(x, y) { this.add(-x, +y) }
    s(x, y) { this.add(-x, +y); this.add(-y, +x) }
    xor(x, y) { this.add(+x, +y); this.add(-x, -y) }
    solve() {
        const N = 2 * this.n
        const dfn = new Int32Array(N + 1)
        const low = new Int32Array(N + 1)
        const inS = new Uint8Array(N + 1)
        const comp = new Int32Array(N + 1)
        const stk = new Int32Array(N + 1)
        let top = 0, tim = 0, cid = 0
        const fV = new Int32Array((N + 1) << 1)
        const fE = new Int32Array((N + 1) << 1)
        const fS = new Int8Array((N + 1) << 1)
        const fC = new Int32Array((N + 1) << 1)
        let ft = 0
        const pushEnter = (v) => {
            fV[ft] = v
            fE[ft] = this.head[v]
            fS[ft] = 0
            ft++
        }
        for (let sv = 1; sv <= N; sv++) {
            if (dfn[sv]) continue
            pushEnter(sv)
            while (ft) {
                const i = ft - 1
                const v = fV[i]
                let e = fE[i]
                const st = fS[i]
                if (st === 0) {
                    dfn[v] = low[v] = ++tim
                    inS[v] = 1
                    stk[++top] = v
                    fS[i] = 1
                } else if (st === 2) {
                    const u = fC[i]
                    if (low[v] > low[u]) low[v] = low[u]
                    fS[i] = 1
                }
                let progressed = false
                for (; e !== -1; e = this.next[e]) {
                    const u = this.to[e]
                    if (dfn[u] === 0) {
                        fE[i] = this.next[e]
                        fC[i] = u
                        fS[i] = 2
                        pushEnter(u)
                        progressed = true
                        break
                    } else if (inS[u]) {
                        if (low[v] > dfn[u]) low[v] = dfn[u]
                    }
                }
                if (progressed) continue
                if (low[v] === dfn[v]) {
                    cid++
                    while (top) {
                        const w = stk[top--]
                        inS[w] = 0
                        comp[w] = cid
                        if (w === v) break
                    }
                }
                ft--
            }
        }
        for (let i = 1; i <= this.n; i++) {
            if (comp[i] === comp[i + this.n]) return { ok: 0 }
        }
        const dab = new Int32Array(this.n + 1)
        for (let i = 1; i <= this.n; i++) dab[i] = +(comp[i] < comp[i + this.n])
        return { ok: 1, dab: dab.slice(1) }
    }
}