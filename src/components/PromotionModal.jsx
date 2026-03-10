/**
 * PromotionModal.jsx
 * Hiện modal chọn quân phong khi tốt đến hàng cuối.
 *
 * Props:
 *   color   : "white" | "black"  — màu của bên đang phong quân
 *   onSelect: (piece: string) => void  — gọi với "Q" | "R" | "B" | "N"
 */
const PIECES = [
    { key: "Q", label: "Hậu",   whiteIcon: "♕", blackIcon: "♛" },
    { key: "R", label: "Xe",    whiteIcon: "♖", blackIcon: "♜" },
    { key: "B", label: "Tượng", whiteIcon: "♗", blackIcon: "♝" },
    { key: "N", label: "Mã",    whiteIcon: "♘", blackIcon: "♞" },
];
const PromotionModal = ({ color, onSelect }) => {
    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <p style={styles.title}>Chọn quân phong</p>
                <div style={styles.grid}>
                    {PIECES.map(({key,label,whiteIcon,blackIcon})=>(
                        <button
                            key={key}
                            style={styles.btn}
                            onClick={() => onSelect(key)}
                            title={label}
                            onMouseEnter={e=>{
                                e.currentTarget.style.background = "#3a3a5a";
                                e.currentTarget.style.transform = "scale(1.08)";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = "#2a2a3e";
                                e.currentTarget.style.transform = "scale(1)";
                            }}
                        >
                            <span style={styles.icon}>
                                {color === "white" ? whiteIcon : blackIcon}
                            </span>
                            <span style={styles.pieceLabel}>{label}</span>
                        </button>
                    ))
                    }
                </div>
            </div>
        </div>
    );

};
const styles = {
    overlay:{
        position:"fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
    },
    modal: {
        background: "#1e1e2e",
        border: "2px solid #a89a6a",
        borderRadius: "12px",
        padding: "24px 32px",
        textAlign: "center",
        boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        minWidth: "260px",
    },
    title: {
        color: "#e8d8a0",
        fontSize: "15px",
        fontWeight: "600",
        letterSpacing: "0.06em",
        marginBottom: "20px",
        textTransform: "uppercase",
        margin: "0 0 20px 0",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "12px",
    },
    btn: {
        background: "#2a2a3e",
        border: "2px solid #a89a6a",
        borderRadius: "8px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "12px 8px",
        transition: "background 0.15s, transform 0.1s",
        color: "#fff",
    },
    icon: {
        fontSize: "38px",
        lineHeight: 1,
        marginBottom: "6px",
        display: "block",
    },
    pieceLabel: {
        fontSize: "11px",
        color: "#c8b870",
        letterSpacing: "0.04em",
    },
}
export default PromotionModal;