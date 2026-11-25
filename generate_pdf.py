import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Don't draw running header on cover/first page
        if self._pageNumber > 1:
            self.drawString(54, 11 * inch - 36, "Smart Restaurant Management System — Project Proposal")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)

        # Running footer on all pages
        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 54, 36, footer_text)
        self.drawString(54, 36, "Confidential — Academic & Faculty Review")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 46, 8.5 * inch - 54, 46)
        
        self.restoreState()

def build_pdf(filename="Smart_Restaurant_Project_Proposal.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#2563eb'),
        spaceAfter=15
    )

    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#64748b'),
        spaceAfter=20
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#1e293b'),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#334155'),
        spaceAfter=8
    )

    bullet_style = ParagraphStyle(
        'BulletText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor('#334155'),
        leftIndent=12,
        spaceAfter=4
    )

    code_block_style = ParagraphStyle(
        'CodeBlock',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#0f172a')
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#334155')
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#0f172a')
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1e40af')
    )

    story = []

    # Title & Header Block
    story.append(Paragraph("PROJECT PROPOSAL & SPECIFICATION", ParagraphStyle('PreTitle', fontName='Helvetica-Bold', fontSize=10, leading=12, textColor=colors.HexColor('#64748b'), spaceAfter=4)))
    story.append(Paragraph("Real-Time Smart Restaurant Management System", title_style))
    story.append(Paragraph("Contactless QR Dining, Real-Time Kitchen Dispatch & Integrated Floor Operations", subtitle_style))
    story.append(Paragraph("<b>Author / Candidate:</b> Engineering Team &nbsp;|&nbsp; <b>Evaluation:</b> Faculty Review & Project Proposal &nbsp;|&nbsp; <b>Status:</b> Project Inception", meta_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563eb'), spaceBefore=0, spaceAfter=14))

    # 1. Executive Summary & Problem Statement
    story.append(Paragraph("1. Executive Summary & Problem Statement", h1_style))
    story.append(Paragraph(
        "Modern dine-in restaurants face systemic operational bottlenecks that degrade customer experience and lower table turnover rates. "
        "Conventional manual workflows rely on waitstaff repeatedly transcribing orders onto physical slips, queuing to input tickets into legacy POS terminals, and manually coordinating with the kitchen line.",
        body_style
    ))
    story.append(Paragraph("<b>Primary Operational Vulnerabilities:</b>", h2_style))
    story.append(Paragraph("• <b>Service Latency:</b> Diners experience friction during peak hours waiting to place orders, request drink refills, or hail waitstaff for assistance.", bullet_style))
    story.append(Paragraph("• <b>Order Transcription Inaccuracies:</b> Handwritten notes and verbal kitchen callouts introduce misinterpretations, wasted food, and kitchen queue delays.", bullet_style))
    story.append(Paragraph("• <b>Static Menu Inefficiencies:</b> Physical menus cannot reflect out-of-stock ('86-ed') dishes, special items, or dynamic price adjustments without expensive reprint cycles.", bullet_style))
    story.append(Paragraph("• <b>Fragmented Metrics:</b> Restaurant management lacks real-time visibility into active table statuses, preparation wait-times, and daily sales trajectories.", bullet_style))

    story.append(Spacer(1, 10))

    # 2. Project Objectives & Proposed Solution
    story.append(Paragraph("2. Project Objectives & Proposed Solution", h1_style))
    story.append(Paragraph(
        "This project proposes an end-to-end, contactless, real-time smart dining platform. "
        "Customers scan a unique table-mounted QR code via their smartphone camera, instantly opening a dynamic web menu customized for their specific table—with zero app installation or signup requirements. "
        "Simultaneously, a centralized Staff Operations Dashboard receives live orders, kitchen tickets, and waiter calls via bi-directional WebSockets.",
        body_style
    ))
    story.append(Paragraph("<b>Key Project Objectives:</b>", h2_style))
    story.append(Paragraph("1. <b>Zero-Friction Customer Experience:</b> Instant browser-based menu browsing, category filtering, cart accumulation, and order submission.", bullet_style))
    story.append(Paragraph("2. <b>Real-Time Bi-Directional Synchronization:</b> Sub-100ms socket-based notification of new orders, live status updates (Pending → Preparing → Ready → Paid), and waiter summons.", bullet_style))
    story.append(Paragraph("3. <b>Role-Based Administrative Control:</b> Strict separation of duties between Administrators (catalog, tables, staff, analytics) and Receptionists (kitchen queue, table servicing).", bullet_style))
    story.append(Paragraph("4. <b>Data Integrity & Atomicity:</b> Database-level transactional guarantees preventing double-booking, race conditions, or mismatched order sums.", bullet_style))

    story.append(Spacer(1, 10))

    # 3. Technology Stack & Technical Justifications
    story.append(Paragraph("3. Technology Stack & Architectural Justifications", h1_style))
    
    tech_data = [
        [Paragraph("Layer", table_header_style), Paragraph("Selected Technology", table_header_style), Paragraph("Technical Justification", table_header_style)],
        [
            Paragraph("Frontend Framework", table_cell_bold),
            Paragraph("React 19 + Vite 8", table_cell_style),
            Paragraph("High-speed build toolchain, minimal client bundle footprint, standard component ecosystem for mobile & desktop.", table_cell_style)
        ],
        [
            Paragraph("Styling Engine", table_cell_bold),
            Paragraph("Tailwind CSS v4", table_cell_style),
            Paragraph("Zero-runtime utility CSS, responsive layout breakpoints, rapid UI design for mobile diner view.", table_cell_style)
        ],
        [
            Paragraph("Client State Management", table_cell_bold),
            Paragraph("Zustand + TanStack Query", table_cell_style),
            Paragraph("Zustand provides lightweight client-side cart/auth stores; TanStack Query manages server caching & query invalidation.", table_cell_style)
        ],
        [
            Paragraph("Backend Runtime", table_cell_bold),
            Paragraph("Node.js (Express ESM)", table_cell_style),
            Paragraph("Asynchronous event loop, high concurrent connection throughput, modular controller-service routing.", table_cell_style)
        ],
        [
            Paragraph("Real-Time Transport", table_cell_bold),
            Paragraph("Socket.io v4.8", table_cell_style),
            Paragraph("Persistent full-duplex TCP WebSockets with room multicasting (dashboard-room, table:<id>) & automatic reconnect.", table_cell_style)
        ],
        [
            Paragraph("Database & ORM", table_cell_bold),
            Paragraph("Prisma ORM + SQLite", table_cell_style),
            Paragraph("Type-safe database client, declarative schema migrations, transactional atomicity. Seamless drop-in switch to PostgreSQL.", table_cell_style)
        ],
        [
            Paragraph("Validation & Security", table_cell_bold),
            Paragraph("Zod + JWT + bcrypt", table_cell_style),
            Paragraph("Strict runtime request schema validation; stateless Bearer JWT token verification; 12-round salted password hashing.", table_cell_style)
        ],
        [
            Paragraph("Analytics & Cloud Media", table_cell_bold),
            Paragraph("Recharts + Cloudinary", table_cell_style),
            Paragraph("SVG data visualization for executive revenue dashboards; offloaded image hosting and transformations.", table_cell_style)
        ]
    ]

    t_tech = Table(tech_data, colWidths=[1.4 * inch, 1.8 * inch, 3.8 * inch])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e293b')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f8fafc'), colors.white]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
    ]))
    story.append(t_tech)

    story.append(PageBreak())

    # 4. System Architecture & High-Level Flow
    story.append(Paragraph("4. System Architecture & High-Level Flow", h1_style))
    story.append(Paragraph(
        "The architecture is partitioned into two specialized client surfaces connected to a unified API and Socket gateway:",
        body_style
    ))

    arch_box_data = [
        [
            Paragraph("<b>CUSTOMER INTERFACE (Mobile Browser)</b><br/>"
                      "• Scans QR URL: <code>/menu/table/:tableId</code><br/>"
                      "• Browses live catalog with real-time availability<br/>"
                      "• Cart accumulator & special preparation notes<br/>"
                      "• Submits order & tracks live timeline status<br/>"
                      "• One-tap 'Call Waiter' assistance emitter", table_cell_style),
            Paragraph("<b>STAFF DASHBOARD (Desktop/Tablet)</b><br/>"
                      "• Real-time order cards with audio chimes<br/>"
                      "• Kanban pipeline: Pending → Preparing → Ready → Paid<br/>"
                      "• Waiter assistance call queue & response acknowledgement<br/>"
                      "• Table overview (Available vs Occupied)<br/>"
                      "• Menu, category, QR generator & revenue analytics", table_cell_style)
        ]
    ]
    t_arch = Table(arch_box_data, colWidths=[3.5 * inch, 3.5 * inch])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), colors.HexColor('#eff6ff')),
        ('BACKGROUND', (1, 0), (1, 0), colors.HexColor('#f0fdf4')),
        ('BOX', (0, 0), (0, 0), 1, colors.HexColor('#93c5fd')),
        ('BOX', (1, 0), (1, 0), 1, colors.HexColor('#86efac')),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t_arch)

    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>End-to-End Order & Notification Lifecycle:</b>", h2_style))
    story.append(Paragraph("1. <b>Discovery:</b> Customer scans table QR code. The client fetches table metadata and active menu items via REST API.", bullet_style))
    story.append(Paragraph("2. <b>Socket Registration:</b> Customer client establishes a WebSocket connection and registers with room <code>table:&lt;tableId&gt;</code>.", bullet_style))
    story.append(Paragraph("3. <b>Atomic Submission:</b> When the customer confirms the cart, <code>POST /api/orders</code> initiates a Prisma transaction that inserts the order, itemizes lines, and transitions the table status from <code>available</code> to <code>occupied</code>.", bullet_style))
    story.append(Paragraph("4. <b>Multicast Dispatch:</b> The server emits <code>order:new</code> to all authenticated staff sockets listening in <code>dashboard-room</code>. Staff hears an audio chime and sees the new order immediately.", bullet_style))
    story.append(Paragraph("5. <b>Kitchen Progression:</b> As staff marks the ticket as <code>preparing</code> or <code>ready</code>, an <code>order:updated</code> or <code>order:ready</code> event pushes to <code>table:&lt;tableId&gt;</code>, updating the diner's screen in real time.", bullet_style))
    story.append(Paragraph("6. <b>Table Reset:</b> Marking the order as <code>paid</code> closes the transaction and updates table status back to <code>available</code> for the next party.", bullet_style))

    story.append(Spacer(1, 10))

    # 5. Database Schema Design & Relational Modeling
    story.append(Paragraph("5. Relational Database Schema & Data Models", h1_style))
    story.append(Paragraph(
        "The relational schema is configured with Prisma ORM to ensure referential integrity, cascading rules, and clean audit timestamps:",
        body_style
    ))

    db_data = [
        [Paragraph("Entity", table_header_style), Paragraph("Key Attributes", table_header_style), Paragraph("Relationships & Constraints", table_header_style)],
        [
            Paragraph("<b>User</b>", table_cell_bold),
            Paragraph("id (UUID), name, email (unique), passwordHash, role ('admin'|'receptionist'), isActive", table_cell_style),
            Paragraph("Enforces role-based authorization for administrative and operational dashboard routes.", table_cell_style)
        ],
        [
            Paragraph("<b>RestaurantTable</b>", table_cell_bold),
            Paragraph("id (UUID), tableNumber (unique, Int), qrCodeUrl, status ('available'|'occupied')", table_cell_style),
            Paragraph("One-to-Many with Order. Deletion restricted when active orders exist (<code>onDelete: Restrict</code>).", table_cell_style)
        ],
        [
            Paragraph("<b>Category</b>", table_cell_bold),
            Paragraph("id (UUID), name, sortOrder (Int)", table_cell_style),
            Paragraph("One-to-Many with MenuItem. Groups menu offerings for clean customer navigation.", table_cell_style)
        ],
        [
            Paragraph("<b>MenuItem</b>", table_cell_bold),
            Paragraph("id (UUID), name, description, price (Decimal), imageUrl, isAvailable (Boolean)", table_cell_style),
            Paragraph("Belongs to Category. Referenced by OrderItems. Soft availability flag prevents broken historical orders.", table_cell_style)
        ],
        [
            Paragraph("<b>Order</b>", table_cell_bold),
            Paragraph("id (UUID), tableId (FK), status ('pending'|'preparing'|'ready'|'paid'|'cancelled'), totalPrice, note", table_cell_style),
            Paragraph("Belongs to RestaurantTable. One-to-Many with OrderItem. Central tracking record for billing and kitchen queue.", table_cell_style)
        ],
        [
            Paragraph("<b>OrderItem</b>", table_cell_bold),
            Paragraph("id (UUID), orderId (FK), menuItemId (FK), quantity (Int), unitPrice (Decimal), note", table_cell_style),
            Paragraph("Belongs to Order (<code>onDelete: Cascade</code>). Captures price snapshot at time of purchase.", table_cell_style)
        ]
    ]

    t_db = Table(db_data, colWidths=[1.3 * inch, 2.7 * inch, 3.0 * inch])
    t_db.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e293b')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f8fafc'), colors.white]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
    ]))
    story.append(t_db)

    story.append(PageBreak())

    # 6. Phased Implementation Roadmap
    story.append(Paragraph("6. Phased Implementation Roadmap", h1_style))
    story.append(Paragraph(
        "The project is structured into four sequential, milestone-driven execution phases to ensure clear academic progress verification:",
        body_style
    ))

    phase_data = [
        [Paragraph("Phase & Timeline", table_header_style), Paragraph("Core Scope & Deliverables", table_header_style), Paragraph("Verification Gate & Acceptance Criteria", table_header_style)],
        [
            Paragraph("<b>Phase 1</b><br/>Weeks 1–2", table_cell_bold),
            Paragraph("• Database architecture & Prisma migrations<br/>"
                      "• Seed data engine (tables, initial categories)<br/>"
                      "• JWT authentication, bcrypt hashing & RBAC middleware<br/>"
                      "• Core REST endpoints for categories & menu items", table_cell_style),
            Paragraph("Automated integration tests validating role rejection for unauthorized routes and clean database seeding.", table_cell_style)
        ],
        [
            Paragraph("<b>Phase 2</b><br/>Weeks 3–4", table_cell_bold),
            Paragraph("• QR code automated generation & storage service<br/>"
                      "• Responsive mobile customer interface (Vite + React)<br/>"
                      "• Zustand client-side cart manager & item modifiers<br/>"
                      "• Atomic order creation with table state transitions", table_cell_style),
            Paragraph("End-to-end test: scanning table QR loads table data; submitting an order sets table status to 'occupied'.", table_cell_style)
        ],
        [
            Paragraph("<b>Phase 3</b><br/>Weeks 5–6", table_cell_bold),
            Paragraph("• Socket.io gateway integration with room multicasting<br/>"
                      "• Live staff dashboard with audio cues & toast alerts<br/>"
                      "• Kitchen status progression controls (Pending → Ready)<br/>"
                      "• Waiter assistance call & acknowledgement handshake", table_cell_style),
            Paragraph("Sub-100ms multi-browser latency test: customer order placement triggers immediate chime and visual card on staff screen.", table_cell_style)
        ],
        [
            Paragraph("<b>Phase 4</b><br/>Weeks 7–8", table_cell_bold),
            Paragraph("• Sales and revenue reporting module with Recharts<br/>"
                      "• Cloudinary image upload pipeline for menu items<br/>"
                      "• User account CRUD & role management<br/>"
                      "• Complete system polish, linting, and final evaluation", table_cell_style),
            Paragraph("Comprehensive audit: revenue calculations match order ledger, image upload behaves predictably, zero console errors.", table_cell_style)
        ]
    ]

    t_phase = Table(phase_data, colWidths=[1.3 * inch, 3.1 * inch, 2.6 * inch])
    t_phase.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e293b')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f8fafc'), colors.white]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
    ]))
    story.append(t_phase)

    story.append(Spacer(1, 14))

    # 7. Faculty Viva Defense & Key Technical Justifications
    story.append(Paragraph("7. Technical Viva Defense Guide (Anticipated Faculty Inquiries)", h1_style))

    q1 = [
        Paragraph("<b>Q1: Why choose WebSockets over traditional HTTP Polling or Server-Sent Events (SSE)?</b>", h2_style),
        Paragraph("<b>Technical Defense:</b> Traditional polling introduces heavy HTTP header overhead (cookies, headers, handshakes) and forces a compromise between network congestion and data latency (e.g., 3–5 second delay). While SSE allows unidirectional server-to-client push, it does not support bi-directional communication. WebSockets (via Socket.io) maintain a single persistent full-duplex TCP stream over port 80/443, enabling sub-50ms round-trip latency for customer-to-kitchen orders and instantaneous waiter summons with minimal overhead.", body_style)
    ]
    story.append(KeepTogether(q1))

    q2 = [
        Paragraph("<b>Q2: How does the system handle concurrent transactions and avoid race conditions?</b>", h2_style),
        Paragraph("<b>Technical Defense:</b> Critical operations—such as order creation coupled with table occupancy transitions—are executed inside atomic Prisma database transactions (<code>prisma.$transaction</code>). If a table is marked unavailable or a menu item price verification fails mid-flight, the entire transaction rolls back completely, preventing orphaned order items or corrupted table occupancy states.", body_style)
    ]
    story.append(KeepTogether(q2))

    q3 = [
        Paragraph("<b>Q3: Why start with SQLite, and what is the production migration strategy?</b>", h2_style),
        Paragraph("<b>Technical Defense:</b> SQLite is a zero-configuration, ACID-compliant file-based database that guarantees portability across faculty assessment machines without requiring external daemon configuration. Because Prisma abstracts the underlying database dialect, transitioning to an enterprise-grade PostgreSQL or MySQL cluster in production requires changing a single line in <code>schema.prisma</code> (<code>provider = 'postgresql'</code>) without rewriting a single business query.", body_style)
    ]
    story.append(KeepTogether(q3))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated {filename}")

if __name__ == "__main__":
    build_pdf()
