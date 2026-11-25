// src/pages/SalesPanel/QuotationPDF.tsx

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { AppSettings } from "../../services/settingsService";

export interface QuotationLineItem {
  category: string;
  label: string;
  price: number;
  quantity: number;
}

export interface CustomerRow {
  label: string;
  value: string;
}

interface QuotationPDFProps {
  customerRows: CustomerRow[];
  lineItems: QuotationLineItem[];
  quotationNumber: string;
  quotationDate: string;
  settings: AppSettings;
  discountPercent?: number;
}

const BRAND = "#173a63";
const INK = "#173a63";
const TEXT = "#1a1a1f";
const MUTED = "#5b6b7f";
const BORDER = "#dce3ea";
const PANEL = "#eef2f7";

const styles = StyleSheet.create({
  page: {
    paddingTop: 26,
    paddingHorizontal: 40,
    paddingBottom: 46,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: TEXT,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: BRAND,
  },
  brandBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  logoBox: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: BRAND,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
  },
  companyName: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
  },
  companyMeta: {
    fontSize: 8.5,
    color: MUTED,
    marginTop: 2,
    lineHeight: 1.4,
  },
  quoteTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: BRAND,
    textAlign: "right",
    letterSpacing: 1,
  },
  quoteMeta: {
    fontSize: 9,
    color: MUTED,
    textAlign: "right",
    marginTop: 4,
  },
  addressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 16,
  },
  addressCol: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: BRAND,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  addressName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  addressLine: {
    fontSize: 9,
    color: MUTED,
    lineHeight: 1.5,
  },
  customerEmpty: {
    fontSize: 9,
    color: "#9a9aa5",
    fontStyle: "italic",
  },
  proposalTitle: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: INK,
    textAlign: "center",
    marginBottom: 8,
  },
  section: {
    marginBottom: 6,
  },
  sectionTab: {
    backgroundColor: INK,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  sectionTabText: {
    color: "#ffffff",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  table: {
    borderWidth: 1,
    borderColor: BORDER,
    borderTopWidth: 0,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: PANEL,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tableHeaderText: {
    color: MUTED,
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tableRowAlt: {
    backgroundColor: "#fbfbfd",
  },
  sectionTotalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: PANEL,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  sectionTotalLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: MUTED,
    marginRight: 14,
  },
  sectionTotalValue: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: TEXT,
    width: 90,
    textAlign: "right",
  },
  colIndex: { width: 24, color: MUTED },
  colLabel: { flex: 1, fontFamily: "Helvetica-Bold" },
  colUnit: { width: 80, textAlign: "right", color: MUTED },
  colQty: { width: 40, textAlign: "right", color: MUTED },
  colTotal: { width: 90, textAlign: "right", fontFamily: "Helvetica-Bold" },
  emptyRow: {
    paddingVertical: 20,
    textAlign: "center",
    color: "#9a9aa5",
    fontSize: 9,
  },
  bottomRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 2,
  },
  summaryBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
  },
  summaryTab: {
    backgroundColor: INK,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  summaryTabText: {
    color: "#ffffff",
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  summaryLabel: {
    color: MUTED,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: PANEL,
  },
  grandTotalLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  grandTotalValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: TEXT,
  },
  gstNote: {
    fontSize: 7,
    color: MUTED,
    paddingHorizontal: 10,
    paddingBottom: 4,
    paddingTop: 2,
  },
  termsBox: {
    flex: 1,
  },
  termsTitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: INK,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  termsItemRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  termsBullet: {
    width: 10,
    fontSize: 7.5,
    color: MUTED,
    lineHeight: 1.35,
  },
  termsItem: {
    flex: 1,
    fontSize: 7.5,
    color: MUTED,
    lineHeight: 1.35,
  },
  signBlock: {
    marginTop: 10,
  },
  signLine: {
    fontSize: 8.5,
    color: MUTED,
  },
  signName: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    marginTop: 12,
  },
  signCompany: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: BRAND,
    marginTop: 1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: INK,
    paddingVertical: 8,
    paddingHorizontal: 40,
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  footerText: {
    color: "#ffffff",
    fontSize: 8,
  },
});

function formatToday() {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function groupByCategory(items: QuotationLineItem[]) {
  const order: string[] = [];
  const map = new Map<string, QuotationLineItem[]>();
  items.forEach((item) => {
    const key = item.category || "Other";
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(item);
  });
  return order.map((category) => ({
    category,
    items: map.get(category)!,
    total: map
      .get(category)!
      .reduce((sum, item) => sum + item.price * item.quantity, 0),
  }));
}

export default function QuotationPDF({
  customerRows,
  lineItems,
  quotationNumber,
  quotationDate,
  settings,
  discountPercent = 0,
}: QuotationPDFProps) {
  const { company, quotation } = settings;
  const gstMultiplier = quotation.gstRate / 100;
  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const discountAmount = subtotal * (discountPercent / 100);
  const taxableAmount = subtotal - discountAmount;
  const gst = taxableAmount * gstMultiplier;
  const grandTotal = taxableAmount + gst;
  const groups = groupByCategory(lineItems);
  const categoryNames = groups.map((g) => g.category);
  const categoryList =
    categoryNames.length <= 1
      ? categoryNames.join("")
      : `${categoryNames.slice(0, -1).join(", ")} and ${categoryNames[categoryNames.length - 1]}`;
  const proposalName =
    groups.length > 0 ? `Proposal for ${categoryList}` : "Proposal";

  const filledRows = customerRows.filter(
    (row) => row.value && row.value.trim(),
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.brandBlock}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>
                {company.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.companyName}>{company.name}</Text>
              <Text style={styles.companyMeta}>{company.tagline}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.quoteTitle}>PROPOSAL</Text>
            <Text style={styles.quoteMeta}>No. {quotationNumber}</Text>
            <Text style={styles.quoteMeta}>
              Date: {quotationDate || formatToday()}
            </Text>
            {!!company.gst && (
              <Text style={styles.quoteMeta}>GSTIN: {company.gst}</Text>
            )}
          </View>
        </View>

        {/* From / To */}
        <View style={styles.addressRow}>
          <View style={styles.addressCol}>
            <Text style={styles.addressLabel}>From</Text>
            <Text style={styles.addressName}>{company.name}</Text>
            <Text style={styles.addressLine}>{company.address}</Text>
            <Text style={styles.addressLine}>
              {company.phone} · {company.email}
            </Text>
          </View>
          <View style={styles.addressCol}>
            <Text style={styles.addressLabel}>To</Text>
            {filledRows.length === 0 ? (
              <Text style={styles.customerEmpty}>
                No customer details provided
              </Text>
            ) : (
              filledRows.map((row, i) =>
                i === 0 ? (
                  <Text key={i} style={styles.addressName}>
                    {row.value}
                  </Text>
                ) : (
                  <Text key={i} style={styles.addressLine}>
                    {row.value}
                  </Text>
                ),
              )
            )}
          </View>
        </View>

        <Text style={styles.proposalTitle}>{proposalName.toUpperCase()}</Text>

        {/* Line items — grouped by category */}
        {groups.length === 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionTab}>
              <Text style={styles.sectionTabText}>Selected Items</Text>
            </View>
            <View style={styles.table}>
              <Text style={styles.emptyRow}>No items selected</Text>
            </View>
          </View>
        ) : (
          groups.map((group, gIdx) => (
            <View style={styles.section} key={group.category} wrap={false}>
              <View style={styles.sectionTab}>
                <Text style={styles.sectionTabText}>
                  {gIdx + 1}. {group.category}
                </Text>
              </View>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, styles.colIndex]}>
                    #
                  </Text>
                  <Text style={[styles.tableHeaderText, styles.colLabel]}>
                    Description
                  </Text>
                  <Text style={[styles.tableHeaderText, styles.colUnit]}>
                    Unit Price
                  </Text>
                  <Text style={[styles.tableHeaderText, styles.colQty]}>
                    Qty
                  </Text>
                  <Text style={[styles.tableHeaderText, styles.colTotal]}>
                    Total
                  </Text>
                </View>

                {group.items.map((item, idx) => (
                  <View
                    key={`${item.category}-${item.label}-${idx}`}
                    style={[
                      styles.tableRow,
                      idx % 2 === 1 ? styles.tableRowAlt : {},
                    ]}
                  >
                    <Text style={styles.colIndex}>{idx + 1}</Text>
                    <Text style={styles.colLabel}>{item.label}</Text>
                    <Text style={styles.colUnit}>
                      {formatCurrency(item.price)}
                    </Text>
                    <Text style={styles.colQty}>{item.quantity}</Text>
                    <Text style={styles.colTotal}>
                      {formatCurrency(item.price * item.quantity)}
                    </Text>
                  </View>
                ))}

                <View style={styles.sectionTotalRow}>
                  <Text style={styles.sectionTotalLabel}>
                    Total — {group.category}
                  </Text>
                  <Text style={styles.sectionTotalValue}>
                    {formatCurrency(group.total)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}

        {/* Terms + Commercial summary */}
        <View style={styles.bottomRow} wrap={false}>
          <View style={styles.termsBox}>
            <Text style={styles.termsTitle}>Terms &amp; Conditions</Text>
            {[
              "This proposal covers only AI analytics and AI hardware; physical cameras are not included.",
              `GST @ ${quotation.gstRate}% will be applicable on the above amounts.`,
              "Delivery is subject to product availability.",
              "Implementation will be scheduled after receipt of PO and necessary details.",
              "Any additional work outside the scope will be charged extra.",
              `Proposal validity: ${quotation.validityDays} days from the date of issue.`,
            ].map((term, i) => (
              <View style={styles.termsItemRow} key={i}>
                <Text style={styles.termsBullet}>•</Text>
                <Text style={styles.termsItem}>{term}</Text>
              </View>
            ))}
          </View>

          <View style={styles.summaryBox}>
            <View style={styles.summaryTab}>
              <Text style={styles.summaryTabText}>Commercial Summary</Text>
            </View>
            {groups.map((group) => (
              <View style={styles.summaryRow} key={group.category}>
                <Text style={styles.summaryLabel}>{group.category}</Text>
                <Text>{formatCurrency(group.total)}</Text>
              </View>
            ))}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text>{formatCurrency(subtotal)}</Text>
            </View>
            {discountPercent > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Discount ({discountPercent}%)
                </Text>
                <Text>-{formatCurrency(discountAmount)}</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Before GST</Text>
              <Text>{formatCurrency(taxableAmount)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                GST ({quotation.gstRate}%)
              </Text>
              <Text>{formatCurrency(gst)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrency(grandTotal)}
              </Text>
            </View>
            <Text style={styles.gstNote}>
              GST @ {quotation.gstRate}% is applicable as per government
              norms.
            </Text>
          </View>
        </View>

        {/* Signature */}
        <View style={styles.signBlock}>
          <Text style={styles.signLine}>Regards,</Text>
          <Text style={styles.signLine}>For {company.name}</Text>
          <Text style={styles.signName}>Authorized Signatory</Text>
          <Text style={styles.signCompany}>{company.name}</Text>
          <Text style={styles.addressLine}>{company.address}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{company.phone}</Text>
          <Text style={styles.footerText}>{company.email}</Text>
          <Text style={styles.footerText}>https://daccess.co.in</Text>
        </View>
      </Page>
    </Document>
  );
}
