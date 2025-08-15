class SparseTable {
    static min = (a,b) => a < b ? a : b
    static max = (a,b) => a > b ? a : b
    static gcd = (a,b) => !b ? a : SparseTable.gcd(b,a%b)
    static lcm = (a,b) => a/SparseTable.gcd(a,b)*b
    
    constructor(a,op) {
        this.a = a
        this.op = op
        this.n = a.length
        this.lg = Array(this.n+1).fill(0)
        for(let i = 2; i <= this.n; i++) this.lg[i] = this.lg[i>>1]+1
        this.k = this.lg[this.n]
        this.t = Array.from({length:this.k+1},()=>Array(this.n))
        for(let i = 0; i < this.n; i++) this.t[0][i] = a[i]
        for(let j = 1; j <= this.k; j++) for(let i = 0; i+(1<<j) <= this.n; i++) this.t[j][i] = op(this.t[j-1][i],this.t[j-1][i+(1<<(j-1))])
    }
    Q(l,r) {
        const j = this.lg[r-l+1]
        return this.op(this.t[j][l],this.t[j][r-(1<<j)+1])
    }
}