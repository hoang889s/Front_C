/**
 * Kiểm tra xem một nước đi có phải là pawn promotion không
 * @param {Object} move - { from: {row, col}, to: {row, col} }
 * @param {Array} board - 8x8 board array
 * @returns {boolean}
 */
export const isPromotionMove = (move, board) => {
  if (!move || !board) return false;

  const { from, to } = move;
  if (!from || !to) return false;

  const piece = board[from.row]?.[from.col];
  if (!piece) return false;

  // Lấy loại quân (P = pawn)
  const pieceLower = piece.toLowerCase();

  // Không phải pawn
  if (pieceLower !== "p") return false;

  
  if (piece === "P" && to.row === 0) {
    return true;
  }

  
  if (piece === "p" && to.row === 7) {
    return true;
  }

  return false;
};

/**
 * Lấy quân cờ từ ký tự promotion
 * @param {string} promotionChar - 'Q', 'R', 'B', 'N'
 * @param {string} color - 'white' hoặc 'black'
 * @returns {string} - Quân cờ viết hoa (Q, R, B, N) hoặc viết thường (q, r, b, n)
 */
export const getPieceFromPromotion = (promotionChar, color) => {
  if (color === "white") {
    return promotionChar.toUpperCase();
  }
  return promotionChar.toLowerCase();
};

/**
 * Format move object với promotion
 * @param {Object} move - { from, to }
 * @param {string} promotionChar - 'Q', 'R', 'B', 'N'
 * @returns {Object} - { from, to, promotion }
 */
export const createPromotionMove = (move, promotionChar) => {
  return {
    from: move.from,
    to: move.to,
    promotion: promotionChar.toUpperCase(),
  };
};