export function BoardGameElements() {
  return (
    <>
      {/* Floating Dice */}
      <div className="absolute top-20 right-10 text-4xl opacity-20 animate-float" style={{ animationDelay: '0s' }}>
        🎲
      </div>
      <div className="absolute top-[40%] left-10 text-3xl opacity-15 animate-float" style={{ animationDelay: '2s' }}>
        🎲
      </div>
      <div className="absolute bottom-32 right-[15%] text-2xl opacity-20 animate-float" style={{ animationDelay: '4s' }}>
        🎲
      </div>

      {/* Playing Cards */}
      <div className="absolute top-[30%] right-[5%] text-3xl opacity-15 animate-float" style={{ animationDelay: '1s' }}>
        🃏
      </div>
      <div className="absolute bottom-40 left-[10%] text-2xl opacity-20 animate-float" style={{ animationDelay: '3s' }}>
        🎴
      </div>

      {/* Game Pieces */}
      <div className="absolute top-[60%] right-[20%] text-2xl opacity-15 animate-float" style={{ animationDelay: '5s' }}>
        ♟️
      </div>
      <div className="absolute top-[50%] left-[5%] text-xl opacity-10 animate-float" style={{ animationDelay: '6s' }}>
        🎯
      </div>

      {/* Geometric Shapes (kept from before) */}
      <div className="absolute top-20 right-0 w-32 h-32 bg-sunny/20 -rotate-12 -z-10 animate-float" />
      <div className="absolute top-60 -left-10 w-24 h-24 bg-grape/15 rotate-45 -z-10 animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-40 right-10 w-16 h-16 bg-coral/20 rotate-12 -z-10 animate-float" style={{ animationDelay: '4s' }} />
    </>
  )
}
