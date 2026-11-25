"""Generates 'University Project book.pdf' - the academic project guide for the
Smart Restaurant System, aligned with the implemented codebase (not the proposal).

Run: python generate_book.py
"""

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    BaseDocTemplate, Frame, HRFlowable, KeepTogether, ListFlowable,
    ListItem, NextPageTemplate, PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle,
)

OUT = "University Project book.pdf"
TITLE = "REAL-TIME SMART RESTAURANT MANAGEMENT SYSTEM"
RUNNING = "Real-Time Smart Restaurant Management System  |  Project Development Guide"

ACCENT = colors.HexColor("#2563eb")
INK = colors.HexColor("#0f172a")
BODY = colors.HexColor("#334155")
MUTED = colors.HexColor("#64748b")
RULE = colors.HexColor("#e2e8f0")
TINT = colors.HexColor("#f8fafc")

TEAM = [
    ("1", "Shanto Sutra Dhar", "241-0243-028", "Team Leader"),
    ("2", "Jahurul Islam Nakib", "241-0249-028", "Designer"),
    ("3", "Anik Chandra Das", "241-0248-028", "Developer"),
    ("4", "Md. Juail", "241-0247-028", "Documentation"),
]

S = getSampleStyleSheet()


def style(name, parent="BodyText", **kw):
    base = dict(fontName="Helvetica", fontSize=9.5, leading=14, textColor=BODY, spaceAfter=7)
    base.update(kw)
    return ParagraphStyle(name, parent=S[parent], **base)


H1 = style("H1x", fontName="Helvetica-Bold", fontSize=17, leading=21,
           textColor=INK, spaceBefore=2, spaceAfter=2)
KICKER = style("Kicker", fontSize=8.5, leading=11, textColor=ACCENT,
               spaceAfter=2, spaceBefore=10)
H2 = style("H2x", fontName="Helvetica-Bold", fontSize=11, leading=15,
           textColor=INK, spaceBefore=11, spaceAfter=4, keepWithNext=1)
P = style("Px")
SMALL = style("Small", fontSize=8, leading=11, textColor=MUTED)
CODE = style("Code", fontName="Courier", fontSize=8, leading=11,
             textColor=colors.HexColor("#1e293b"), backColor=TINT,
             borderPadding=6, leftIndent=6, spaceBefore=4, spaceAfter=8)
COVER_T = style("CoverT", fontName="Helvetica-Bold", fontSize=27, leading=32,
                textColor=INK, alignment=TA_CENTER, spaceAfter=10)
COVER_SUB = style("CoverSub", fontSize=12.5, leading=17, textColor=ACCENT,
                  alignment=TA_CENTER, spaceAfter=6)
COVER_META = style("CoverMeta", fontSize=10, leading=15, textColor=MUTED,
                   alignment=TA_CENTER)


def bullets(items, indent=14):
    return ListFlowable(
        [ListItem(Paragraph(t, P), leftIndent=indent) for t in items],
        bulletType="bullet", start="circle", leftIndent=indent + 4,
        bulletFontSize=6, bulletColor=ACCENT, spaceAfter=8,
    )


def numbers(items, indent=14):
    return ListFlowable(
        [ListItem(Paragraph(t, P), leftIndent=indent) for t in items],
        bulletType="1", leftIndent=indent + 4, bulletFontSize=8,
        bulletColor=ACCENT, spaceAfter=8,
    )


def table(rows, widths, header=True):
    data = [[Paragraph(c, style("TH", fontName="Helvetica-Bold", fontSize=8.2,
                                leading=11, textColor=INK if header else BODY,
                                spaceAfter=0))
             for c in r] for r in rows]
    t = Table(data, colWidths=widths, repeatRows=1 if header else 0, hAlign="LEFT")
    cmds = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("GRID", (0, 0), (-1, -1), 0.4, RULE),
    ]
    if header:
        cmds += [("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#eef2ff")),
                 ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, TINT])]
    else:
        cmds += [("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, TINT])]
    t.setStyle(TableStyle(cmds))
    # Short tables stay whole; long ones may split so a page is not left half blank.
    if len(rows) <= 8:
        return KeepTogether([t, Spacer(1, 8)])
    t.spaceAfter = 8
    return t


def chapter(num, title, focus):
    return [Paragraph(f"CHAPTER {num}", KICKER),
            Paragraph(title, H1),
            Paragraph(focus, style("Focus", fontSize=9, leading=12,
                                   textColor=MUTED, spaceAfter=4)),
            HRFlowable(width="100%", thickness=0.8, color=RULE,
                       spaceBefore=3, spaceAfter=9)]


# ---------------------------------------------------------------- page furniture
def decorate(c, doc):
    c.saveState()
    w, h = A4
    if doc.page > 1:
        c.setFont("Helvetica", 7.5)
        c.setFillColor(MUTED)
        c.drawString(22 * mm, h - 15 * mm, RUNNING)
        c.setStrokeColor(RULE)
        c.setLineWidth(0.5)
        c.line(22 * mm, h - 17 * mm, w - 22 * mm, h - 17 * mm)
        c.drawRightString(w - 22 * mm, 12 * mm, f"Page {doc.page}")
        c.drawString(22 * mm, 12 * mm, "Academic Project Development Guide")
        c.line(22 * mm, 15.5 * mm, w - 22 * mm, 15.5 * mm)
    c.restoreState()


def cover(c, doc):
    c.saveState()
    w, h = A4
    c.setFillColor(colors.HexColor("#f1f5f9"))
    c.rect(0, 0, w, h, stroke=0, fill=1)
    c.setFillColor(ACCENT)
    c.rect(0, h - 9 * mm, w, 9 * mm, stroke=0, fill=1)
    c.setFillColor(INK)
    c.rect(0, 0, w, 4 * mm, stroke=0, fill=1)
    c.restoreState()


# ---------------------------------------------------------------- content
def build_story():
    s = []

    # ---------------- cover
    s += [Spacer(1, 62 * mm),
          Paragraph("A Complete Project Development Guide", COVER_SUB),
          Paragraph(TITLE, COVER_T),
          Spacer(1, 6 * mm),
          HRFlowable(width="42%", thickness=1.2, color=ACCENT,
                     hAlign="CENTER", spaceAfter=8),
          Paragraph("Contactless QR Dining &#8226; Real-Time Kitchen Dispatch "
                    "&#8226; Integrated Floor Operations", COVER_META),
          Spacer(1, 26 * mm)]

    rows = [["SL", "Name", "ID", "Remarks"]] + [list(r) for r in TEAM]
    t = Table([[Paragraph(c, style("CT", fontSize=9.5, leading=13,
                                   textColor=INK, alignment=TA_CENTER))
                for c in r] for r in rows],
              colWidths=[12 * mm, 52 * mm, 38 * mm, 32 * mm], hAlign="CENTER")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("BACKGROUND", (0, 1), (-1, -1), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.4, RULE),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    t.setStyle(TableStyle([("TEXTCOLOR", (0, 0), (-1, 0), colors.white)]))
    s += [t, Spacer(1, 20 * mm),
          Paragraph("Aligned with the implemented codebase &#8226; 2026", COVER_META),
          NextPageTemplate("body"), PageBreak()]

    # ---------------- contents
    s += [Paragraph("CONTENTS", KICKER),
          Paragraph("Contents &amp; How to Use This Book", H1),
          HRFlowable(width="100%", thickness=0.8, color=RULE,
                     spaceBefore=3, spaceAfter=9),
          Paragraph("A practical guide for understanding, building, testing, and "
                    "presenting the delivered system. Every feature described here "
                    "has been implemented and tested in the source repository.",
                    P)]

    toc = [["#", "Chapter", "Main focus"]]
    chapters = [
        ("1", "Project Overview", "Purpose, scope, users, and expected outcomes"),
        ("2", "Problem Statement and Objectives", "Restaurant workflow problems and measurable goals"),
        ("3", "Requirements and User Roles", "Functional requirements and the two implemented staff roles"),
        ("4", "System Architecture", "Client surfaces, API, sockets, and request flow"),
        ("5", "Technology Stack", "The exact versions installed in the repository"),
        ("6", "Development Environment", "Tools, setup, scripts, and folder structure"),
        ("7", "Database Design and Data Models", "Entities, relations, constraints, and actual schema"),
        ("8", "Backend API Design and Business Rules", "Routes, validation, transactions"),
        ("9", "Customer QR Ordering Experience", "Table QR, menu, cart, and order submission"),
        ("10", "Staff Dashboard and Order Workflow", "Order queue, five-state lifecycle, waiter calls"),
        ("11", "Real-Time Communication", "Socket rooms, authentication, event catalogue"),
        ("12", "Authentication, Authorization, and Security", "JWT, bcrypt, role guards, known gaps"),
        ("13", "Administration, Reporting, and Analytics", "Menu, tables, staff, sales reports"),
        ("14", "Implementation Roadmap", "What was built, in which order"),
        ("15", "Testing and Quality Assurance", "Automated suite, manual test cases, acceptance criteria"),
        ("16", "Deployment, Operations, and Maintenance", "Build, PM2, environment, backups"),
        ("17", "Demonstration and Technical Viva", "Presentation sequence and likely questions"),
        ("18", "Conclusion, Limitations, and Final Checklist", "Honest limitations and submission checklist"),
    ]
    toc += [list(c) for c in chapters]
    s.append(table(toc, [10 * mm, 62 * mm, 92 * mm]))
    s.append(Paragraph(
        "<b>How to use this guide.</b> Read the chapters in order. Chapters 7 to 12 "
        "describe the code that exists today; each one names the file that implements "
        "it so the reader can verify the claim. Do not present a feature as complete "
        "unless it appears in this guide and can be demonstrated live.", P))

    # ---------------- 1 overview
    s += [PageBreak()] + chapter(1, "Project Overview",
        "What the system is, who it serves, and how the pieces connect.")
    s.append(Paragraph(
        "The Real-Time Smart Restaurant Management System is a web platform that digitises "
        "dine-in restaurant operations. A customer scans the QR code printed for their table, "
        "opens a mobile-friendly menu in the browser, selects items, and submits an order "
        "without installing an application or creating an account. Restaurant staff use a "
        "single authenticated dashboard to receive orders, advance them through the kitchen "
        "workflow, respond to waiter calls, and monitor table occupancy.", P))
    s.append(Paragraph(
        "The design connects both surfaces through one backend. Ordinary REST requests load "
        "menu data, authenticate staff, and commit transactions. A Socket.io channel pushes "
        "committed changes to the staff dashboard and to the customer's table room so neither "
        "screen needs a manual refresh.", P))
    s.append(Paragraph("Project scope", H2))
    s.append(bullets([
        "Customer-facing mobile web menu with category browsing, item details, cart, notes, "
        "order submission, and live order status.",
        "Table-specific QR codes that resolve to the dining table that placed the order.",
        "Staff dashboard for live order monitoring, kitchen progression, table overview, "
        "and waiter assistance.",
        "Administrator functions for menu categories, menu items, tables, staff accounts, "
        "and sales analytics.",
        "Database-backed records for users, tables, categories, menu items, orders, and "
        "order items, with a unit-price snapshot on every line.",
    ]))
    s.append(Paragraph("Expected outcome", H2))
    s.append(Paragraph(
        "A working academic prototype that demonstrates the complete order lifecycle end to "
        "end: the customer submits an order, the server validates and stores it inside a "
        "transaction, the staff dashboard receives it without a refresh, staff advance its "
        "status, the customer's own screen reflects each change, and the table is released "
        "only after every order on it is closed. Role-based access is enforced on the server, "
        "not only in the interface.", P))
    s.append(Paragraph("Out of scope", H2))
    s.append(Paragraph(
        "Online payment gateway integration, inventory and purchasing, tax-compliant "
        "invoicing, multi-branch management, a dedicated kitchen-display role, and "
        "production-grade cloud scaling are not part of the delivered prototype. They are "
        "listed as future enhancements in Chapter 18.", P))

    # ---------------- 2 problem
    s += [PageBreak()] + chapter(2, "Problem Statement and Objectives",
        "Why a connected ordering workflow is worth building, and how success is measured.")
    s.append(Paragraph("Existing operational problems", H2))
    s.append(bullets([
        "<b>Service latency.</b> A customer waits for a waiter to become available before "
        "ordering or requesting assistance.",
        "<b>Transcription errors.</b> Handwritten notes and verbal relay produce wrong items, "
        "wrong quantities, and lost special instructions.",
        "<b>Static menus.</b> Printed menus cannot show that an item has just sold out or "
        "changed price.",
        "<b>Limited visibility.</b> Managers have no live view of table occupancy, the "
        "preparation queue, or sales patterns during service.",
        "<b>Fragmented communication.</b> Customer, floor staff, and kitchen rely on separate, "
        "verbal channels.",
    ]))
    s.append(Paragraph("Proposed solution", H2))
    s.append(Paragraph(
        "A table-aware digital menu paired with a central operational dashboard. Structured "
        "order data reaches the server directly, removing manual transcription. Menu "
        "availability is controlled by an authorised user. Every committed order change is "
        "broadcast to the screens that need it, so the floor and the kitchen work from the "
        "same state.", P))
    s.append(Paragraph("Core objectives", H2))
    s.append(numbers([
        "Provide a zero-install customer experience through browser-based QR ordering.",
        "Synchronise order creation and status changes between customer and staff interfaces.",
        "Separate administrative and operational permissions through role-based access control.",
        "Protect transaction integrity so order creation and table-occupancy changes succeed or "
        "fail together.",
        "Report sales totals, completed orders, average order value, top-selling items, and "
        "peak ordering periods from stored data.",
    ]))
    s.append(Paragraph("Success indicators", H2))
    s.append(Paragraph(
        "The prototype passes an end-to-end demonstration across multiple browser sessions: a "
        "new order appears on the staff dashboard without a manual refresh, status changes "
        "appear on the customer screen, and the server rejects invalid quantities, unavailable "
        "items, unauthorised actions, and any transition out of a terminal order state.", P))

    # ---------------- 3 requirements
    s += [PageBreak()] + chapter(3, "Requirements and User Roles",
        "The functional requirements as delivered, and the staff roles that actually exist.")
    s.append(Paragraph("Functional requirements", H2))
    s.append(table([
        ["ID", "Requirement", "Primary user", "Implemented in"],
        ["FR-01", "Open a table-specific menu using a QR code", "Customer",
         "/menu/table/:tableId"],
        ["FR-02", "Browse categories and available menu items", "Customer", "GET /api/v1/menu"],
        ["FR-03", "Add items, quantities, and notes to a cart", "Customer", "cartStore"],
        ["FR-04", "Submit an order linked to a valid table", "Customer", "POST /api/v1/orders"],
        ["FR-05", "View order status updates", "Customer", "OrderSuccess page"],
        ["FR-06", "Receive and process live orders", "Receptionist / Admin",
         "Dashboard page"],
        ["FR-07", "Acknowledge waiter assistance requests", "Receptionist / Admin",
         "waiter:request / waiter:responding"],
        ["FR-08", "Manage menu, tables, staff, and reports", "Administrator", "Admin routes (Ch. 8)"],
    ], [16 * mm, 74 * mm, 34 * mm, 40 * mm]))
    s.append(Paragraph("Non-functional requirements", H2))
    s.append(bullets([
        "<b>Usability.</b> Customer pages are responsive and usable on common smartphones.",
        "<b>Performance.</b> Common actions answer promptly under demonstration load; no "
        "response-time figure is claimed as guaranteed because none was benchmarked.",
        "<b>Reliability.</b> Order creation and table-state changes are committed in a single "
        "database transaction.",
        "<b>Security.</b> Protected routes verify identity and role on the server.",
        "<b>Maintainability.</b> Routes, controllers, schemas, middleware, and services are "
        "separated on the backend; pages, stores, hooks, and API client on the frontend.",
        "<b>Accessibility.</b> Readable contrast, labelled controls, keyboard-reachable "
        "buttons, and explicit error messages.",
    ]))
    s.append(Paragraph("Role boundaries", H2))
    s.append(Paragraph(
        "The delivered system implements <b>two</b> staff roles. A <b>receptionist</b> signs in, "
        "sees the live dashboard, advances orders through confirmation, preparation, and "
        "service, and acknowledges waiter calls. An <b>administrator</b> does everything a "
        "receptionist does and additionally manages categories, menu items, tables, staff "
        "accounts, and reports, and is the only role permitted to finalise an order as paid or "
        "cancelled. A <b>customer</b> is unauthenticated and may only read the menu and submit "
        "an order for a valid table.", P))
    s.append(Paragraph(
        "A third role, KITCHEN, appeared in the original proposal. It was deliberately deferred "
        "and is listed as future work in Chapter 18; the preparation workflow is currently "
        "driven by the receptionist account. These boundaries are enforced in backend "
        "middleware (<font face='Courier' size='8'>src/middleware/auth.js</font>), not only by "
        "hiding interface elements.", P))

    # ---------------- 4 architecture
    s += [PageBreak()] + chapter(4, "System Architecture",
        "How the customer browser, the staff dashboard, the API, the database and the socket "
        "gateway cooperate.")
    s.append(Paragraph(
        "Two client surfaces share one backend. The customer interface is optimised for mobile "
        "browsers; the staff dashboard is optimised for desktop and tablet. Both use HTTPS REST "
        "endpoints and both open a Socket.io connection for live events.", P))
    s.append(table([
        ["Layer", "Responsibility", "Location"],
        ["Customer web client", "QR entry, menu, cart, order submission, live status, waiter call",
         "frontend/src/pages/customer"],
        ["Staff dashboard", "Order cards, status actions, table overview, waiter queue",
         "frontend/src/pages/admin"],
        ["REST API", "Authentication, menu retrieval, order creation, status updates, reporting",
         "backend/src/routes"],
        ["Socket gateway", "Room-based notifications, authenticated rooms, reconnection",
         "backend/src/server.js"],
        ["Business services", "Validation, authorisation, price calculation, table-state rules",
         "backend/src/controllers"],
        ["Database", "Users, tables, categories, menu items, orders, order items",
         "backend/prisma/schema.prisma"],
    ], [30 * mm, 72 * mm, 62 * mm]))
    s.append(Paragraph("High-level order lifecycle", H2))
    s.append(numbers([
        "The customer scans the table QR code, which opens a URL containing the table identifier.",
        "The client requests the table record, the menu, and the categories from the REST API.",
        "The customer builds a cart in browser state and submits it to the order endpoint.",
        "The backend verifies the table exists, every item exists, and every item is available.",
        "The backend reads current prices, computes the total, and writes the order, its items, "
        "and the table-occupancy change inside one transaction.",
        "After the transaction commits, the server emits <i>order:new</i> and, when applicable, "
        "<i>table:status_changed</i> to the staff room.",
        "Staff advance the order status; the server validates the transition, stores it, and "
        "emits <i>order:updated</i> to the staff room and to that table's room.",
        "When an order reaches paid or cancelled, the server counts the table's remaining "
        "active orders and releases the table only if none remain.",
    ]))
    s.append(Paragraph(
        "<b>Design rule.</b> The browser is never trusted to calculate the final bill or to "
        "decide whether a table is free. The server reads current prices and validates every "
        "state transition.", P))

    # ---------------- 5 stack
    s += [PageBreak()] + chapter(5, "Technology Stack",
        "The stack as installed in the repository, with the version recorded in each "
        "package.json.")
    s.append(Paragraph("Backend", H2))
    s.append(table([
        ["Technology", "Version", "Purpose"],
        ["Node.js + Express", "Express 4.21", "Runtime and REST API"],
        ["Prisma ORM", "6.4", "Typed data access, migrations, transactions"],
        ["SQLite", "file:./dev.db", "Zero-configuration academic database"],
        ["Socket.io", "4.8", "Bidirectional real-time events"],
        ["Zod", "4.3", "Request body validation on every mutating route"],
        ["jsonwebtoken + bcrypt", "9.0 / 5.1", "Staff authentication, 8-hour tokens, bcrypt cost 12"],
        ["Cloudinary + multer", "1.41 / 1.4", "Menu item image upload"],
        ["qrcode", "1.5", "Table QR generation as a data URL"],
        ["Vitest + Supertest", "4.1 / 7.2", "Automated API and security tests"],
    ], [40 * mm, 26 * mm, 98 * mm]))
    s.append(Paragraph("Frontend", H2))
    s.append(table([
        ["Technology", "Version", "Purpose"],
        ["React + Vite", "19.2 / 8.0", "Component-based interfaces"],
        ["Tailwind CSS", "4.2", "Utility styling and responsive layout"],
        ["Zustand", "5.0", "Cart and authentication client state"],
        ["TanStack Query", "5.100", "Server-state fetching and cache invalidation"],
        ["React Router", "7.14", "Customer and staff routing"],
        ["Socket.io client", "4.8", "Live order and waiter events"],
        ["Recharts", "3.8", "Sales charts on the reports page"],
        ["React Hot Toast + lucide-react", "2.6 / 1.11", "Feedback and iconography"],
    ], [40 * mm, 26 * mm, 98 * mm]))
    s.append(Paragraph("Why this stack", H2))
    s.append(Paragraph(
        "One language on both sides of the wire removes context switching for a student team. "
        "Express keeps the API explicit and readable. Prisma provides typed queries and "
        "<font face='Courier' size='8'>$transaction</font> for the order-plus-table write. "
        "Socket.io supplies event delivery with reconnection. SQLite is appropriate for a local "
        "academic prototype, and Prisma isolates the provider choice so a later move to "
        "PostgreSQL is a configuration and migration exercise.", P))
    s.append(Paragraph(
        "<b>Version note.</b> The version numbers above are those actually installed. Treat them "
        "as the record of this submission rather than as a recommendation; package versions move "
        "and mutual compatibility must be re-checked before any future upgrade.", P))

    # ---------------- 6 environment
    s += [PageBreak()] + chapter(6, "Development Environment and Project Structure",
        "A repeatable local setup, the real folder layout, and the scripts that drive it.")
    s.append(Paragraph("Required tools", H2))
    s.append(bullets([
        "Node.js LTS and npm for the runtime and package management.",
        "Visual Studio Code or another editor.",
        "Git for source control.",
        "A modern browser with developer tools, and a second browser or a private window for "
        "multi-session real-time testing.",
        "Prisma Studio or a SQLite viewer for inspecting records.",
        "Postman, Bruno, or an equivalent API client for endpoint testing.",
    ]))
    s.append(Paragraph("Actual folder structure", H2))
    s.append(Paragraph(
        "The repository uses <b>frontend/</b> and <b>backend/</b> at the root, which differs from "
        "the <i>client/</i> and <i>server/</i> names used earlier in planning. The names below are "
        "the ones on disk.", P))
    s.append(Paragraph(
        "backend/&nbsp;&nbsp;prisma/schema.prisma, seed.js<br/>"
        "backend/&nbsp;&nbsp;src/routes, src/controllers, src/schemas, src/middleware, src/services<br/>"
        "backend/&nbsp;&nbsp;src/app.js, src/server.js, src/prisma.js<br/>"
        "frontend/&nbsp;src/pages/customer, src/pages/admin, src/components/admin<br/>"
        "frontend/&nbsp;src/store, src/hooks, src/api, src/test<br/>"
        "root/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;prd.md, README.md, ecosystem.config.cjs, generate_book.py", CODE))
    s.append(Paragraph("Setup commands", H2))
    s.append(Paragraph(
        "npm run install-all          # install root, backend, frontend<br/>"
        "npm run db:migrate           # prisma migrate dev<br/>"
        "npm run db:generate          # generate the Prisma client<br/>"
        "npm run db:seed              # admin user and sample data<br/>"
        "npm run dev                  # backend + frontend concurrently<br/>"
        "npm test --prefix backend    # Vitest API and security suite<br/>"
        "npm test --prefix frontend   # Vitest store and render suite<br/>"
        "npm run pm2                  # production process manager", CODE))
    s.append(Paragraph(
        "Secrets live in a backend <font face='Courier' size='8'>.env</font> file that is excluded "
        "from Git: <font face='Courier' size='8'>DATABASE_URL</font>, "
        "<font face='Courier' size='8'>JWT_SECRET</font>, "
        "<font face='Courier' size='8'>FRONTEND_URL</font>, and the three Cloudinary keys. The "
        "frontend reads <font face='Courier' size='8'>VITE_API_BASE_URL</font> and "
        "<font face='Courier' size='8'>VITE_SOCKET_URL</font>.", P))

    # ---------------- 7 database
    s += [PageBreak()] + chapter(7, "Database Design and Data Models",
        "Six entities, their relations and deletion rules, exactly as declared in "
        "prisma/schema.prisma.")
    s.append(table([
        ["Entity", "Fields", "Relation"],
        ["User", "id, name, email, passwordHash, role, isActive, createdAt, updatedAt",
         "Creates and administers records"],
        ["RestaurantTable", "id, tableNumber (unique), qrCodeUrl, status, timestamps",
         "One table has many historical orders"],
        ["Category", "id, name, sortOrder, timestamps", "One category has many menu items"],
        ["MenuItem", "id, name, description, price, imageUrl, isAvailable, categoryId",
         "Belongs to one optional category"],
        ["Order", "id, tableId, status, note, totalPrice, timestamps",
         "Belongs to one table; has many order items"],
        ["OrderItem", "id, orderId, menuItemId, quantity, unitPrice, note",
         "Belongs to one order and one menu item"],
    ], [30 * mm, 80 * mm, 54 * mm]))
    s.append(Paragraph("Modelling decisions that matter", H2))
    s.append(bullets([
        "<b>Price snapshot.</b> OrderItem stores <font face='Courier' size='8'>unitPrice</font>, so "
        "a later menu price change never rewrites what an earlier customer was charged.",
        "<b>Decimal money.</b> Prices are Prisma <font face='Courier' size='8'>Decimal</font>, not "
        "floating point, so totals do not drift.",
        "<b>Deletion rules.</b> An order is restricted from deleting a table it references "
        "(<i>onDelete: Restrict</i>); order items cascade with their order "
        "(<i>onDelete: Cascade</i>). Historical revenue therefore survives table edits.",
        "<b>Optional links.</b> Category on MenuItem and MenuItem on OrderItem are optional so a "
        "category can be removed or a discontinued item retired without destroying past orders.",
        "<b>Status as string with enum validation.</b> Status columns are strings for simple "
        "migration; the permitted values are enforced by Zod schemas and by an explicit "
        "transition map in the order controller.",
    ]))
    s.append(Paragraph("Table states", H2))
    s.append(Paragraph(
        "<font face='Courier' size='8'>available</font> means the table is free. "
        "<font face='Courier' size='8'>occupied</font> is set automatically when the first order "
        "is committed against a free table, and is restored to "
        "<font face='Courier' size='8'>available</font> only when the last active order on that "
        "table reaches a terminal state. A table accepting a second round of orders is therefore "
        "expected behaviour, not a conflict.", P))

    # ---------------- 8 API
    s += [PageBreak()] + chapter(8, "Backend API Design and Business Rules",
        "Routes, access levels, validation and the transaction that protects integrity.")
    s.append(table([
        ["Method and path", "Purpose", "Access"],
        ["POST /api/v1/auth/login", "Staff sign-in, returns JWT and user", "Public"],
        ["GET /api/v1/auth/me", "Current staff profile", "Any authenticated staff"],
        ["GET /api/v1/menu, GET /api/v1/menu/:id", "Menu items", "Public"],
        ["POST /api/v1/menu, PUT/DELETE /api/v1/menu/:id", "Menu item CRUD, image upload, availability toggle", "Admin"],
        ["PATCH /api/v1/menu/:id/toggle", "Toggle item availability", "Admin"],
        ["GET /api/v1/categories", "Category list", "Public"],
        ["POST/PUT/DELETE /api/v1/categories/:id", "Category CRUD", "Admin"],
        ["GET /api/v1/tables/:id", "Table details for the QR page", "Public"],
        ["GET /api/v1/tables", "Table overview", "Any authenticated staff"],
        ["POST /api/v1/tables, PUT/DELETE /api/v1/tables/:id", "Table CRUD", "Admin"],
        ["POST /api/v1/tables/:id/regenerate-qr", "Regenerate a table's QR code", "Admin"],
        ["POST /api/v1/orders", "Create an order for a table", "Public table context"],
        ["GET /api/v1/orders, GET /api/v1/orders/:id", "Order monitoring", "Any authenticated staff"],
        ["GET /api/v1/orders/table/:tableId", "Orders for one table", "Any authenticated staff"],
        ["PATCH /api/v1/orders/:id/status", "Advance the workflow", "Staff; paid/cancelled admin only"],
        ["DELETE /api/v1/orders/:id", "Cancel an order", "Admin"],
        ["GET /api/v1/reports/sales, /api/v1/reports/inventory", "Sales and inventory analytics", "Admin"],
        ["GET/POST /api/v1/users, PUT/DELETE /api/v1/users/:id", "Staff account management", "Admin"],
    ], [58 * mm, 62 * mm, 44 * mm]))
    s.append(Paragraph("Order creation sequence", H2))
    s.append(numbers([
        "Validate the body with Zod: table id, a non-empty item array, a positive integer "
        "quantity per line, and an optional note.",
        "Load the table; reject an unknown table with 404.",
        "Load each menu item; reject an unknown item with 404 and an unavailable item with 400.",
        "Read each price from the database and accumulate the total on the server.",
        "Create the order and its order items, and flip the table to occupied when it was free, "
        "inside a single <font face='Courier' size='8'>prisma.$transaction</font>.",
        "Emit real-time events only after the transaction returns successfully.",
    ]))
    s.append(Paragraph("Status transition map", H2))
    s.append(table([
        ["From", "Allowed next", "Rule"],
        ["pending", "confirmed, cancelled", "Receptionist confirms a new order"],
        ["confirmed", "preparing, cancelled", "Kitchen work starts"],
        ["preparing", "served, cancelled", "Food leaves the kitchen"],
        ["served", "paid", "Payment taken at the counter"],
        ["paid", "none", "Terminal state; further changes rejected with 400"],
        ["cancelled", "none", "Terminal state"],
    ], [28 * mm, 48 * mm, 88 * mm], header=True))
    s.append(Paragraph(
        "Two further rules apply. Only an administrator may set paid or cancelled directly "
        "through the status endpoint (403 otherwise), and any transition out of a terminal order "
        "is refused. HTTP codes follow a consistent convention: 400 invalid input or illegal "
        "transition, 401 missing or invalid token, 403 insufficient role, 404 missing resource, "
        "409 conflict where a uniqueness rule is violated.", P))

    # ---------------- 9 customer
    s += [PageBreak()] + chapter(9, "Customer QR Ordering Experience",
        "The journey from scanning a code to watching the plate arrive.")
    s.append(Paragraph("QR code and table identification", H2))
    s.append(Paragraph(
        "Each table row stores a generated QR data URL that encodes "
        "<font face='Courier' size='8'>/menu/table/&lt;tableId&gt;</font>. Scanning it opens the "
        "menu page for that table, and the page confirms the table number in its header so the "
        "customer can see they scanned the right code. The identifier is the table's UUID, which "
        "is high-entropy and not guessable by enumeration; a signed short-lived token would be a "
        "further hardening step and is listed in Chapter 18.", P))
    s.append(Paragraph("Customer page components", H2))
    s.append(bullets([
        "Header with the table number for confirmation.",
        "Category filter bar plus a searchable menu grid.",
        "Item cards showing name, description, price, and availability.",
        "Cart panel with quantity controls, per-item notes, an order-level note, and a subtotal "
        "computed client-side for display only.",
        "A <b>Call Waiter</b> button with a visible calling state and a 30-second cooldown.",
        "An order-tracking screen that shows Pending, Confirmed, Preparing, Served, and "
        "Completed stages.",
    ]))
    s.append(Paragraph("Cart and order integrity", H2))
    s.append(Paragraph(
        "The cart lives in browser state only. On submission the backend recomputes every price "
        "and re-checks availability, so a stale cart cannot produce a wrong charge. If an item "
        "becomes unavailable between adding and submitting, the server rejects that line and the "
        "customer revises the cart. The success screen is reached only after the server answers "
        "201 with an order id, and that id is carried to the tracking page so the customer "
        "follows their own order rather than any other table's.", P))
    s.append(Paragraph("Order request shape", H2))
    s.append(Paragraph(
        '{<br/>&nbsp;&nbsp;"table_id": "&lt;uuid&gt;",<br/>'
        '&nbsp;&nbsp;"note": "optional order note",<br/>'
        '&nbsp;&nbsp;"items": [<br/>'
        '&nbsp;&nbsp;&nbsp;&nbsp;{ "menu_item_id": "&lt;uuid&gt;", "quantity": 2, "note": "Less spicy" },<br/>'
        '&nbsp;&nbsp;&nbsp;&nbsp;{ "menu_item_id": "&lt;uuid&gt;", "quantity": 1 }<br/>'
        '&nbsp;&nbsp;]<br/>}', CODE))

    # ---------------- 10 dashboard
    s += [PageBreak()] + chapter(10, "Staff Dashboard and Order Workflow",
        "One operational screen for receiving orders, advancing them, and answering calls.")
    s.append(Paragraph("What the dashboard shows", H2))
    s.append(bullets([
        "KPI cards for pending, preparing, and ready-to-serve counts.",
        "A live waiter-request strip that appears only when a call is open.",
        "Order cards grouped by state, each showing order number, table, elapsed time, items, "
        "quantities, and special notes.",
        "Context-sensitive action buttons that offer only the transitions legal from the current "
        "state, so an operator cannot pick an invalid one.",
        "Table occupancy tiles that refresh through socket events.",
    ]))
    s.append(Paragraph("Order status workflow", H2))
    s.append(table([
        ["Status", "Meaning", "Next status"],
        ["pending", "Order received, awaiting confirmation", "confirmed, cancelled"],
        ["confirmed", "Accepted by staff, queued for the kitchen", "preparing, cancelled"],
        ["preparing", "Being cooked", "served, cancelled"],
        ["served", "Delivered to the table", "paid"],
        ["paid", "Settled and closed", "terminal"],
        ["cancelled", "Cancelled under an authorised rule", "terminal"],
    ], [26 * mm, 66 * mm, 72 * mm]))
    s.append(Paragraph(
        "This five-stage delivery flow is the implemented workflow. The original planning "
        "documents used the labels Preparing, Ready, and Paid only; the delivered system adds a "
        "confirmation step and names the Ready stage <i>served</i> to match how the floor staff "
        "talk about it. The transition map in the previous chapter is the authoritative "
        "definition, and the backend rejects anything outside it.", P))
    s.append(Paragraph("Waiter assistance", H2))
    s.append(numbers([
        "The customer presses Call Waiter; the browser emits "
        "<font face='Courier' size='8'>waiter:call</font> with the table id.",
        "The server confirms the table exists and emits "
        "<font face='Courier' size='8'>waiter:request</font> to the staff room.",
        "The dashboard shows the request with the table number and a Respond action.",
        "Responding emits <font face='Courier' size='8'>waiter:responding</font>, which the server "
        "relays only to that table's room, and the customer sees a confirmation toast.",
        "The button then holds a cooldown so a table cannot flood the queue.",
    ]))
    s.append(Paragraph(
        "Calls are transient events rather than database rows in this version. The consequence, "
        "recorded honestly in Chapter 18, is that an unacknowledged call is not restored after a "
        "dashboard reload.", P))
    s.append(Paragraph("Table overview", H2))
    s.append(Paragraph(
        "Tables are shown as available or occupied. Occupancy is not cleared merely because food "
        "is served; it is released when the last active order on the table is finalised, which "
        "matches how a real floor works when guests order a second round.", P))

    # ---------------- 11 realtime
    s += [PageBreak()] + chapter(11, "Real-Time Communication with Socket.io",
        "Rooms, authentication, and the complete event catalogue.")
    s.append(Paragraph(
        "Socket.io keeps a persistent connection with automatic reconnection. It carries the "
        "events that should appear without a refresh; REST remains responsible for loading "
        "initial data and for every validated state change. Persisted data is always the record "
        "of truth and events are only the notification of it.", P))
    s.append(Paragraph("Room strategy", H2))
    s.append(table([
        ["Room", "Who may join", "How membership is granted"],
        ["staff room", "admin and receptionist only",
         "Client emits join:dashboard; server checks the JWT role first"],
        ["table:&lt;tableId&gt;", "the customer who scanned that table's code",
         "Client emits join:table; server verifies the table exists"],
    ], [34 * mm, 62 * mm, 74 * mm]))
    s.append(Paragraph(
        "Events are never addressed to every connected socket. A newly created order and every "
        "status change go to the staff room; the same status change and the cancellation event go "
        "to the affected table's room so only that table's customer sees it. A client cannot "
        "subscribe to an arbitrary room, and the staff room rejects connections without a valid "
        "staff token.", P))
    s.append(Paragraph("Event catalogue", H2))
    s.append(table([
        ["Event", "Direction", "Purpose"],
        ["join:dashboard", "client to server", "Request staff-room membership; role checked"],
        ["join:table", "client to server", "Request table-room membership"],
        ["order:new", "server to staff", "A committed order needs attention"],
        ["order:updated", "server to staff and table", "A status change was committed"],
        ["order:cancelled", "server to staff and table", "An order was cancelled"],
        ["order:ready", "server to table", "Food is served; customer is notified"],
        ["table:status_changed", "server to staff", "Occupancy changed"],
        ["waiter:call", "client to server", "Customer requests assistance"],
        ["waiter:request", "server to staff", "Assistance queue entry"],
        ["waiter:responding", "client to server, then server to table",
         "Staff acknowledged; customer is told"],
    ], [42 * mm, 54 * mm, 74 * mm]))
    s.append(Paragraph(
        "<b>Ordering rule.</b> Emit only after the database transaction has committed, otherwise "
        "staff could receive an order that was never saved. The dashboard also reloads the "
        "current queue over REST when it opens or reconnects, so a lost event cannot leave the "
        "screen permanently stale.", P))

    # ---------------- 12 security
    s += [PageBreak()] + chapter(12, "Authentication, Authorization, and Security",
        "What is enforced, and what is consciously left as future work.")
    s.append(Paragraph("Authentication", H2))
    s.append(Paragraph(
        "Staff sign in with an email and password. The server compares the password against a "
        "bcrypt hash (cost factor 12) and returns a signed JWT carrying the user id, email, role, "
        "and name with an eight-hour expiry. Passwords are never stored in plain text and never "
        "returned by any endpoint. The token is sent in the Authorization header and verified on "
        "every protected route.", P))
    s.append(Paragraph("Authorisation", H2))
    s.append(table([
        ["Role", "May do", "May not do"],
        ["admin", "Everything a receptionist does, plus category, menu, table and staff "
                  "management, reports, and finalising orders as paid or cancelled",
         "Nothing within the application"],
        ["receptionist", "View the dashboard, advance status to confirmed, preparing, served, "
                         "acknowledge waiter calls", "Manage catalogue or staff; finalise payment"],
        ["customer", "Read the menu, submit an order for a valid table, watch that table's status",
         "Reach any staff route or read another table's order"],
    ], [24 * mm, 76 * mm, 70 * mm]))
    s.append(Paragraph(
        "Authorisation is applied in middleware on the server. Interface guards exist as a "
        "convenience only; removing them would not open a route.", P))
    s.append(Paragraph("Controls in place", H2))
    s.append(bullets([
        "Zod schemas validate every mutating request body.",
        "JWT verification and role checks protect all staff and administrative routes.",
        "bcrypt with cost 12 protects stored passwords.",
        "Secrets and the database URL live in environment variables that are excluded from Git.",
        "CORS origin is read from FRONTEND_URL. The fallback when it is unset is permissive, "
        "so it must be set in any shared or deployed environment.",
        "Errors return clear messages without stack traces or sensitive values.",
        "Financial totals are computed from database prices only; a client-supplied total is "
        "ignored.",
        "Terminal orders are immutable, and only an administrator may finalise payment.",
    ]))
    s.append(Paragraph("Known gaps, stated honestly", H2))
    s.append(Paragraph(
        "There is no rate limiting on the login or waiter-call paths, no refresh-token rotation, "
        "no audit table recording which user changed a status, and no signed short-lived table "
        "token in the QR URL. The waiter-call queue is transient. These are listed in Chapter 18 "
        "as future work rather than presented as complete. For an academic prototype served on a "
        "trusted network they are acceptable; for a public deployment they must be closed before "
        "launch.", P))

    # ---------------- 13 admin
    s += [PageBreak()] + chapter(13, "Administration, Reporting, and Analytics",
        "The controls a manager needs, and the definitions behind each reported number.")
    s.append(Paragraph("Administration modules", H2))
    s.append(bullets([
        "<b>Categories.</b> Create, rename, order, and delete menu categories.",
        "<b>Menu.</b> Create and edit items with name, description, price, image upload, and an "
        "availability toggle so a sold-out dish disappears from the customer menu immediately.",
        "<b>Tables.</b> Create tables, generate and regenerate QR codes, and watch occupancy.",
        "<b>Staff.</b> Create accounts, assign role, deactivate rather than delete, and reset "
        "credentials.",
        "<b>Orders.</b> Inspect current and historical orders; a cancellation is admin-only.",
    ]))
    s.append(Paragraph("Reported metrics", H2))
    s.append(table([
        ["Metric", "Definition"],
        ["Gross sales", "Sum of order totals for orders in paid status"],
        ["Completed orders", "Count of orders in paid status"],
        ["Average order value", "Gross sales divided by completed orders, when the count is above zero"],
        ["Top-selling items", "Menu items ranked by total purchased quantity"],
        ["Peak ordering period", "Time bucket containing the most submitted orders"],
    ], [40 * mm, 130 * mm]))
    s.append(Paragraph(
        "Each figure is computed from stored rows, so the dashboard and the written report agree. "
        "Charts are labelled, state the selected range, and fall back to an empty-state message "
        "when no data exists rather than rendering a misleading empty axis. Reports are "
        "admin-only; no customer identity is exposed because orders are tied to tables, not "
        "people.", P))

    # ---------------- 14 roadmap
    s += [PageBreak()] + chapter(14, "Implementation Roadmap",
        "The order in which the system was actually built, and how each phase was verified.")
    s.append(table([
        ["Phase", "Delivered", "How it was verified"],
        ["1. Foundation",
         "Schema, seed, JWT authentication, role middleware, menu and category APIs",
         "Migrations run; seeded admin signs in; unauthorised calls return 403"],
        ["2. Customer ordering",
         "QR generation, responsive menu, cart, order endpoint, table occupancy",
         "Scanning a table code loads that menu; orders persist with correct totals"],
        ["3. Real-time operations",
         "Socket gateway, staff dashboard, status workflow, waiter call and acknowledgement",
         "New orders and status changes appear in a second browser without refresh"],
        ["4. Completion",
         "Admin panel, reports, automated tests, documentation, this guide",
         "Test suites pass; end-to-end scenario demonstrated"],
    ], [34 * mm, 70 * mm, 66 * mm]))
    s.append(Paragraph("Scope control", H2))
    s.append(Paragraph(
        "The core lifecycle was finished before optional features were started. Where time was "
        "short, payment integration, inventory, a kitchen role, and advanced analytics were "
        "postponed rather than letting order integrity or authorisation slip. A reliable "
        "QR-to-order-to-kitchen-to-status demonstration is worth more than a wider set of "
        "half-finished screens.", P))

    # ---------------- 15 testing
    s += [PageBreak()] + chapter(15, "Testing and Quality Assurance",
        "What is automated today, and the manual cases that prove the lifecycle.")
    s.append(Paragraph("Automated suites", H2))
    s.append(table([
        ["Suite", "Location", "Covers"],
        ["API tests", "backend/src/app.test.js", "Route wiring and response shapes"],
        ["Security tests", "backend/src/security.test.js", "Rejected unauthenticated and "
         "wrong-role access, invalid tokens"],
        ["Validation tests", "backend/src/validation.test.js", "Zod schema acceptance and rejection"],
        ["Store tests", "frontend/src/store/*.test.js", "Cart arithmetic and auth state"],
        ["Render tests", "frontend/src/App.test.tsx", "Application shells render"],
    ], [34 * mm, 60 * mm, 76 * mm]))
    s.append(Paragraph(
        "Run <font face='Courier' size='8'>npm test --prefix backend</font> and "
        "<font face='Courier' size='8'>npm test --prefix frontend</font>. The suites currently "
        "stand at 14 backend assertions and 9 frontend assertions, all passing, and the "
        "production build completes.", P))
    s.append(Paragraph("Manual acceptance cases", H2))
    s.append(table([
        ["ID", "Action", "Expected result"],
        ["TC-01", "Scan a valid table QR", "That table's menu opens and the table number is shown"],
        ["TC-02", "Open a menu URL with an unknown table id", "Clear error; no table data exposed"],
        ["TC-03", "Order available items", "Order and order items are saved with the correct total"],
        ["TC-04", "Submit an item that is unavailable", "Server rejects the request with 400"],
        ["TC-05", "Submit quantity zero or negative", "Validation rejects the request with 400"],
        ["TC-06", "Open the dashboard in a second browser, then order",
         "The order appears without a manual refresh"],
        ["TC-07", "Advance the order to served", "The customer's own screen shows each new stage"],
        ["TC-08", "Call the admin endpoint as a receptionist token",
         "Server returns 403; the interface does not matter"],
        ["TC-09", "Place a second order on an occupied table",
         "Accepted; the table stays occupied until the last order is finalised"],
        ["TC-10", "Reconnect after a network drop",
         "The dashboard reloads current data and resumes receiving events"],
        ["TC-11", "Press Call Waiter, then respond on the dashboard",
         "Only that table's screen shows the acknowledgement"],
        ["TC-12", "Change the status of a paid order", "Server returns 400; terminal state is immutable"],
    ], [14 * mm, 72 * mm, 84 * mm]))
    s.append(Paragraph("Common issues and remedies", H2))
    s.append(bullets([
        "<b>Live events never arrive.</b> Check the socket URL in the frontend environment, the "
        "CORS origin on the server, whether the token carried the correct role, and whether the "
        "client actually joined a room.",
        "<b>Prisma reports a schema mismatch.</b> Run the migration and regenerate the client.",
        "<b>The QR opens the wrong table.</b> Inspect the generated URL for that table row.",
        "<b>The total is wrong.</b> Confirm the server recomputed it from database prices; a "
        "client-side total is never authoritative.",
        "<b>The customer sees no status change.</b> Confirm the tracking page had a table id in "
        "navigation state and joined the table room.",
    ]))

    # ---------------- 16 deployment
    s += [PageBreak()] + chapter(16, "Deployment, Operations, and Maintenance",
        "From a local prototype to a controlled demonstration.")
    s.append(Paragraph("Deployment checklist", H2))
    s.append(numbers([
        "Build the React client and set the production API and socket URLs.",
        "Start the backend under a process manager; the repository ships an "
        "<font face='Courier' size='8'>ecosystem.config.cjs</font> for PM2.",
        "Use PostgreSQL or another managed database if the target environment needs concurrent "
        "writers, scheduled backups, and operational resilience.",
        "Set production environment variables securely and never commit the environment file.",
        "Configure HTTPS, allowed origins, database credentials, and log retention.",
        "Run migrations and create the initial administrator account over a secure channel.",
        "Test QR links from a real phone against the deployed domain.",
        "Verify REST and socket connectivity from outside the development network.",
    ]))
    s.append(Paragraph("SQLite and the production migration path", H2))
    s.append(Paragraph(
        "SQLite suits the academic prototype. Moving to PostgreSQL is a provider change plus a "
        "migration run, not a one-click switch: provider-specific types, index behaviour, decimal "
        "handling, and connection pooling all warrant review, and the migration should be "
        "rehearsed against a copy of the data before it touches a live restaurant.", P))
    s.append(Paragraph("Maintenance", H2))
    s.append(bullets([
        "Back up the database on a schedule and rehearse a restore.",
        "Monitor server errors, failed logins, and socket health.",
        "Keep dependencies current and review security advisories.",
        "Document how to add a menu item, create a table, and disable a staff account.",
        "Retain only the operational data the restaurant's policy permits.",
    ]))
    s.append(Paragraph(
        "The prototype should be described as a working academic system on a documented host, "
        "not as production-ready. That claim would require security, load, backup, and "
        "operational review that this project has not undergone.", P))

    # ---------------- 17 viva
    s += [PageBreak()] + chapter(17, "Demonstration and Technical Viva",
        "A short script that shows the system working, and answers to the questions it invites.")
    s.append(Paragraph("Suggested demonstration sequence", H2))
    s.append(numbers([
        "State the restaurant problem and why QR ordering removes a bottleneck.",
        "Scan a table's QR code and show the menu opening with the correct table number.",
        "Add items with a note and submit; show the server-confirmed order on the tracking screen.",
        "Open the dashboard in a second browser and show the order arriving live.",
        "Advance it from pending to confirmed, then preparing, then served, pointing out that the "
        "action buttons only offer legal transitions.",
        "Show the customer screen receiving each update, and only for that table.",
        "Press Call Waiter, answer it on the dashboard, and show the customer confirmation.",
        "Open the admin area, toggle an item out of stock, and show it disappear from the menu; "
        "then show a sales report.",
        "Close on architecture, the data model, the automation results, and the honest "
        "limitations.",
    ]))
    s.append(Paragraph("Likely questions and concise answers", H2))
    qa = [
        ("Why QR ordering?",
         "It gives a customer browser access to a table-specific menu with no app to install and "
         "no account to create."),
        ("Why Socket.io rather than polling?",
         "It gives event-driven bidirectional updates with reconnect handling, so screens update "
         "without repeated requests."),
        ("What do REST APIs still do?",
         "Load data and perform every validated state change; sockets only announce what has "
         "already been committed."),
        ("Why a database transaction for order creation?",
         "So the order, its items, and the table occupancy change commit or fail together."),
        ("Why store unit price on each order line?",
         "So a later menu price change does not rewrite the amount an earlier customer paid."),
        ("What is RBAC, and where is it enforced?",
         "Role-based access control; enforced in server middleware by verifying the JWT role, "
         "not by hiding buttons."),
        ("Why start with SQLite?",
         "It is zero-configuration and ACID-compliant for a single-host prototype; PostgreSQL is "
         "the documented production path."),
        ("How do you stop a customer sending a fake total?",
         "The order endpoint ignores any client total and recomputes from database prices."),
        ("How is a table released?",
         "When its last active order reaches paid or cancelled; serving food alone does not free "
         "it."),
        ("What happens if a socket event is lost?",
         "The dashboard reloads the queue over REST on connect and reconnect, so state recovers."),
        ("What would you add next?",
         "Rate limiting on login and waiter calls, an audit trail of status changes, a kitchen "
         "role with its own screen, and database-backed waiter calls."),
    ]
    for q, a in qa:
        s.append(Paragraph(f"<b>Q: {q}</b>", style("Q", fontName="Helvetica-Bold", spaceAfter=2,
                                                    spaceBefore=6)))
        s.append(Paragraph(f"A: {a}", style("A", leftIndent=10, spaceAfter=6)))

    # ---------------- 18 conclusion
    s += [PageBreak()] + chapter(18, "Conclusion, Limitations, and Final Checklist",
        "What was delivered, what it does not do yet, and what to submit.")
    s.append(Paragraph(
        "The prototype connects four parties - customer, service staff, kitchen workflow, and "
        "administrator - through one consistent platform. React serves both interfaces, Node and "
        "Express own the business rules, Prisma and SQLite persist the records, and Socket.io "
        "keeps the screens in step. The result is a system that can be demonstrated, explained, "
        "and extended.", P))
    s.append(Paragraph("Known limitations", H2))
    s.append(bullets([
        "No online payment; payment is recorded by changing an order to paid.",
        "Two staff roles only. A dedicated kitchen role and kitchen display screen are not built.",
        "Waiter calls are events, not stored records, so an unanswered call is lost on a "
        "dashboard reload.",
        "No rate limiting on login or waiter calls.",
        "No audit trail of which user changed an order status.",
        "The QR link carries the table identifier directly; a signed short-lived token would "
        "harden it.",
        "Reports cover sales aggregates only; no export or scheduled delivery.",
        "Tested on a single host with demonstration-scale data; no load testing has been "
        "performed.",
    ]))
    s.append(Paragraph("Future enhancements", H2))
    s.append(bullets([
        "Payment gateway integration and digital receipts.",
        "Kitchen display role and screen with preparation timers.",
        "Persisted waiter calls with acknowledgement state and escalation.",
        "Inventory tracking with low-stock alerts and ingredient-level costing.",
        "Multi-branch support with branch-scoped reporting.",
        "Customer accounts, order history, loyalty points, and feedback.",
        "Multilingual menus and further accessibility work.",
        "Signed table tokens and rate limiting for a public deployment.",
    ]))
    s.append(Paragraph("Final submission checklist", H2))
    s.append(bullets([
        "The customer QR ordering flow works from a real smartphone.",
        "The dashboard receives new orders and status changes in real time.",
        "Database relations, constraints, and transaction rules are documented and match the "
        "schema on disk.",
        "Authentication and role permissions are tested on the backend.",
        "Invalid input, unavailable items, and terminal-state changes are rejected.",
        "Both automated suites pass and the production build succeeds.",
        "Screenshots, the architecture diagram, the ER diagram, the test cases, and the user "
        "guide are included.",
        "Limitations and future enhancements are stated honestly, as in this chapter.",
        "All source, setup instructions, and demonstration credentials are organised for "
        "evaluation.",
    ]))
    s.append(Paragraph("Reference documentation", H2))
    s.append(Paragraph(
        "react.dev, vite.dev, nodejs.org, expressjs.com, socket.io/docs, prisma.io/docs, "
        "sqlite.org/docs, tanstack.com/query, zustand.docs.pmnd.rs, zod.dev. Consult these while "
        "coding, because APIs and recommended practice move.", SMALL))
    s.append(Spacer(1, 14))
    s.append(HRFlowable(width="30%", thickness=1, color=ACCENT, hAlign="CENTER"))
    s.append(Paragraph("END OF BOOK", style("End", fontSize=9, leading=12, textColor=MUTED,
                                            alignment=TA_CENTER, spaceBefore=8)))
    return s


def build():
    doc = BaseDocTemplate(OUT, pagesize=A4,
                          leftMargin=22 * mm, rightMargin=22 * mm,
                          topMargin=24 * mm, bottomMargin=20 * mm,
                          title="Real-Time Smart Restaurant Management System - Project Guide",
                          author="Shanto Sutra Dhar, Jahurul Islam Nakib, Anik Chandra Das, Md. Juail")
    frame = Frame(22 * mm, 20 * mm, A4[0] - 44 * mm, A4[1] - 44 * mm, id="main")
    doc.addPageTemplates([
        PageTemplate(id="cover", frames=[frame], onPage=cover),
        PageTemplate(id="body", frames=[frame], onPage=decorate),
    ])
    story = build_story()
    doc.build(story)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    build()
