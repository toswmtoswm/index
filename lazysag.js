class LazySeg {
    constructor(arr, mode = 2) {
        this.n = arr.length
        this.big = typeof arr[0] === 'bigint'
        if (this.big) {
            this.mode = mode
            this.MOD = 1000000007n
        } else {
            this.mode = mode // 0: min, 1: max, 2: sum, 3: times
            if (this.mode === 3) {
                this.MOD = 1e9 + 7
            }
        }
        this.seg = Array(4 * this.n).fill(this._defaultValue())
        this.lazy = Array(4 * this.n).fill(this.big && this.mode === 3 ? 1n : (this.mode === 3 ? 1 : 0))
        this._build(arr, 1, 0, this.n - 1)
    }

    _defaultValue() {
        if (this.mode === 0) return this.big ? (1n << 60n) : Infinity
        if (this.mode === 1) return this.big ? -(1n << 60n) : -Infinity
        if (this.mode === 2) return this.big ? 0n : 0
        if (this.mode === 3) return this.big ? 1n : 1
    }

    _combine(a, b) {
        if (this.mode === 0) return this.big ? (a < b ? a : b) : Math.min(a, b)
        if (this.mode === 1) return this.big ? (a > b ? a : b) : Math.max(a, b)
        if (this.mode === 2) return this.big ? (a + b) : (a + b)
        if (this.mode === 3) return this.big ? ((a * b) % this.MOD) : ((a * b) % this.MOD)
    }

    _apply(node, s, e, val) {
        if (this.mode === 0 || this.mode === 1) {
            if (this.big) {
                this.seg[node] = this.seg[node] + BigInt(val)
                if (s !== e) {
                    this.lazy[node * 2] = this.lazy[node * 2] + val
                    this.lazy[node * 2 + 1] = this.lazy[node * 2 + 1] + val
                }
            } else {
                this.seg[node] += val
                if (s !== e) {
                    this.lazy[node * 2] += val
                    this.lazy[node * 2 + 1] += val
                }
            }
        } else if (this.mode === 2) {
            if (this.big) {
                this.seg[node] = this.seg[node] + BigInt(val) * BigInt(e - s + 1)
                if (s !== e) {
                    this.lazy[node * 2] = this.lazy[node * 2] + val
                    this.lazy[node * 2 + 1] = this.lazy[node * 2 + 1] + val
                }
            } else {
                this.seg[node] += val * (e - s + 1)
                if (s !== e) {
                    this.lazy[node * 2] += val
                    this.lazy[node * 2 + 1] += val
                }
            }
        } else if (this.mode === 3) {
            if (this.big) {
                this.seg[node] = this.seg[node] * this._modPow(val, BigInt(e - s + 1), this.MOD) % this.MOD
                if (s !== e) {
                    this.lazy[node * 2] = (this.lazy[node * 2] * val) % this.MOD
                    this.lazy[node * 2 + 1] = (this.lazy[node * 2 + 1] * val) % this.MOD
                }
            } else {
                this.seg[node] = this.seg[node] * this._modPow(val, e - s + 1, this.MOD) % this.MOD
                if (s !== e) {
                    this.lazy[node * 2] = this.lazy[node * 2] * val % this.MOD
                    this.lazy[node * 2 + 1] = this.lazy[node * 2 + 1] * val % this.MOD
                }
            }
        }
    }

    _modPow(a, b, mod) {
        let res = this.big ? 1n : 1, base = a % mod
        if (this.big) {
            while (b > 0n) {
                if (b & 1n) res = (res * base) % mod
                base = (base * base) % mod
                b >>= 1n
            }
        } else {
            while (b > 0) {
                if (b & 1) res = res * base % mod
                base = base * base % mod
                b >>= 1
            }
        }
        return res
    }

    _push(node, s, e) {
        if (this.big) {
            if (this.lazy[node] !== (this.mode === 3 ? 1n : 0n)) {
                this._apply(node, s, e, this.lazy[node])
                this.lazy[node] = this.mode === 3 ? 1n : 0n
            }
        } else {
            if (this.lazy[node] !== 0) {
                this._apply(node, s, e, this.lazy[node])
                this.lazy[node] = 0
            }
        }
    }

    _build(arr, node, l, r) {
        if (l === r) {
            this.seg[node] = arr[l]
            return
        }
        const mid = (l + r) >> 1
        this._build(arr, node * 2, l, mid)
        this._build(arr, node * 2 + 1, mid + 1, r)
        this.seg[node] = this._combine(this.seg[node * 2], this.seg[node * 2 + 1])
    }

    query(l, r, node = 1, s = 0, e = this.n - 1) {
        this._push(node, s, e)
        if (r < s || e < l) return this._defaultValue()
        if (l <= s && e <= r) return this.seg[node]
        const mid = (s + e) >> 1
        const left = this.query(l, r, node * 2, s, mid)
        const right = this.query(l, r, node * 2 + 1, mid + 1, e)
        return this._combine(left, right)
    }

    rangeUpdate(l, r, val, node = 1, s = 0, e = this.n - 1) {
        this._push(node, s, e)
        if (r < s || e < l) return
        if (l <= s && e <= r) {
            this._apply(node, s, e, val)
            return
        }
        const mid = (s + e) >> 1
        this.rangeUpdate(l, r, val, node * 2, s, mid)
        this.rangeUpdate(l, r, val, node * 2 + 1, mid + 1, e)
        this.seg[node] = this._combine(this.seg[node * 2], this.seg[node * 2 + 1])
    }

    update(idx, val, node = 1, s = 0, e = this.n - 1) {
        this._push(node, s, e)
        if (s === e) {
            this.seg[node] = val
            return
        }
        const mid = (s + e) >> 1
        if (idx <= mid) this.update(idx, val, node * 2, s, mid)
        else this.update(idx, val, node * 2 + 1, mid + 1, e)
        this.seg[node] = this._combine(this.seg[node * 2], this.seg[node * 2 + 1])
    }

    clear(val = null) {
        const segVal = val !== null ? val : this._defaultValue()
        const lazyVal = this.big ? (this.mode === 3 ? 1n : 0n) : (this.mode === 3 ? 1 : 0)
        this.seg.fill(segVal)
        this.lazy.fill(lazyVal)
    }
}