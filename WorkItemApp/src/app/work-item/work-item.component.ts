import { Component, OnInit } from '@angular/core';
import { WorkItemService } from '../work-item.service';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-work-item',
  templateUrl: './work-item.component.html',
  styleUrls: ['./work-item.component.css'],
})
export class WorkItemComponent implements OnInit {
  itemId: string = ''; // ItemId entered by user
  selectedWorkItem: any = null; // To store the selected work item
  workItems: any[] = []; // Array to hold all work items fetched from JSON
  showModal: boolean = false; // Flag to control modal display

  // Checkbox values
  workItemDetailsSelected: boolean = true;
  workItemNotesSelected: boolean = true;
  workItemAttachmentsSelected: boolean = true;
  workItemAuditHistorySelected: boolean = true;

  constructor(private workItemService: WorkItemService) {}

  ngOnInit() {
    // Fetch all work items when the component initializes
    this.workItemService.getAllWorkItems().subscribe((data) => {
      this.workItems = data; // Store the fetched work items
    });
  }

  // Preview work item details based on entered ItemId
  preview() {
    // Get the work item by ItemId
    this.selectedWorkItem = this.workItemService.getDetailsByItemId(this.itemId, this.workItems);

    if (this.selectedWorkItem) {
      this.showModal = true; // Open the modal if work item found
    } else {
      alert('ItemId not found!'); // Handle case if ItemId is not found
    }
  }

  // Close the modal
  closeModal() {
    this.showModal = false;
  }

  // Download the selected data as PDF using jsPDF
  downloadPDF() {
    const doc = new jsPDF();

  // Helper function to draw table headers
  const drawTableHeader = (headers: string[], startX: number, startY: number, colWidth: number) => {
    doc.setFontSize(12);
    headers.forEach((header, index) => {
      doc.text(header, startX + colWidth * index, startY);
      doc.rect(startX + colWidth * index, startY - 6, colWidth, 10);  // Draws the cell around the header text
    });
  };

  // Helper function to draw table row data
  const drawTableRow = (rowData: string[], startX: number, startY: number, colWidth: number) => {
    doc.setFontSize(10);
    rowData.forEach((data, index) => {
      doc.text(data || 'N/A', startX + colWidth * index, startY);  // Fallback to 'N/A' if data is undefined or null
      doc.rect(startX + colWidth * index, startY - 6, colWidth, 10);  // Draws the cell around the data
    });
  };

  // Starting position
  let startX = 10;
  let startY = 20;
  let colWidth = 50;

  // Add Work Item Details section
  if (this.workItemDetailsSelected && this.selectedWorkItem?.CosmicWorkItem) {
    doc.setFontSize(14);
    doc.text('Work Item Details:', startX, startY);
    startY += 10; // Move to next row

    const workItem = this.selectedWorkItem.CosmicWorkItem;
    const workItemData = [
      ['ItemId', workItem.ItemId || 'N/A'],
      ['ItemDate', workItem.ItemDate || 'N/A'],
      ['SendingBank', workItem.SendingBank || 'N/A'],
      ['Step', workItem.Step || 'N/A'],
      ['Owner', workItem.Owner || 'N/A'],
      ['ParentCaseId', workItem.ParentCaseId || 'N/A'],
      ['SharingCategory', workItem.SharingCategory || 'N/A'],
      ['BusinessUnit', workItem.BusinessUnit || 'N/A'],
      ['TypeOfRisk', workItem.TypeOfRisk || 'N/A']
    ];

    // Draw each row in the Work Item Details section
    for (let i = 0; i < workItemData.length; i++) {
      drawTableRow(workItemData[i], startX, startY, colWidth);
      startY += 10;  // Move down for the next row
    }
    startY += 10;  // Add some extra space before the next section
  }

  // Add Work Item Notes section
  if (this.workItemNotesSelected && this.selectedWorkItem?.WorkItemNotes) {
    const notes = this.selectedWorkItem.WorkItemNotes || [];
    if (notes.length > 0) {
      doc.setFontSize(14);
      doc.text('Work Item Notes:', startX, startY);
      startY += 10;

      // Table headers for notes
      drawTableHeader(['Note Date', 'Entered By', 'Related Action'], startX, startY, colWidth);
      startY += 10;

      // Draw each row in the Work Item Notes section
      for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        drawTableRow(
          [
            note.NoteDate || 'N/A',
            note.EnteredBy || 'N/A',
            note.RelatedAction || 'N/A'
          ],
          startX, startY, colWidth
        );
        startY += 10;
      }
      startY += 10;
    } else {
      doc.text('No Work Item Notes available.', startX, startY);
      startY += 10;
    }
  }

  // Add Work Item Attachments section
  if (this.workItemAttachmentsSelected && this.selectedWorkItem?.WorkItemAttachments) {
    const attachments = this.selectedWorkItem.WorkItemAttachments || [];
    if (attachments.length > 0) {
      doc.setFontSize(14);
      doc.text('Work Item Attachments:', startX, startY);
      startY += 10;

      // Table headers for attachments
      drawTableHeader(['File Name', 'Attach Date', 'Size (KB)'], startX, startY, colWidth);
      startY += 10;

      // Draw each row in the Work Item Attachments section
      for (let i = 0; i < attachments.length; i++) {
        const attachment = attachments[i];
        drawTableRow(
          [
            attachment.FileName || 'N/A',
            attachment.AttachDate || 'N/A',
            attachment.SizeKB ? `${attachment.SizeKB}` : 'N/A'
          ],
          startX, startY, colWidth
        );
        startY += 10;
      }
      startY += 10;
    } else {
      doc.text('No Work Item Attachments available.', startX, startY);
      startY += 10;
    }
  }

  // Add Work Item Audit History section
  if (this.workItemAuditHistorySelected && this.selectedWorkItem?.WorkItemAuditHistory) {
    const auditHistory = this.selectedWorkItem.WorkItemAuditHistory || [];
    if (auditHistory.length > 0) {
      doc.setFontSize(14);
      doc.text('Work Item Audit History:', startX, startY);
      startY += 10;

      // Table headers for audit history
      drawTableHeader(['Date', 'Action', 'Performed By'], startX, startY, colWidth);
      startY += 10;

      // Draw each row in the Work Item Audit History section
      for (let i = 0; i < auditHistory.length; i++) {
        const audit = auditHistory[i];
        drawTableRow(
          [
            audit.Date || 'N/A',
            audit.Action || 'N/A',
            audit.PerformedBy || 'N/A'
          ],
          startX, startY, colWidth
        );
        startY += 10;
      }
      startY += 10;
    } else {
      doc.text('No Work Item Audit History available.', startX, startY);
      startY += 10;
    }
  }

  // Save the PDF
  doc.save(`WorkItem_${this.itemId}.pdf`);
  }
}
