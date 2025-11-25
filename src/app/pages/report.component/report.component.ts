import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ClientService } from '../../core/services/client.service';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { ParkingInterface } from '../../core/models/parking-response.interface';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
})
export class ReportComponent implements OnInit {
  private clientService = inject(ClientService);
  private userService = inject(UserService);

  readonly parking = signal<ParkingInterface[]>([]);
  readonly searchTerm = signal('');
  readonly currentPage = signal(1);
  readonly itemsPerPage = 10;
  readonly isLoading = signal(true);

  readonly paginatedParking = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const filtered = this.parking().filter((spot) =>
      [
        spot.siteName,
        spot.buildingName,
        spot.floorNo,
        spot.vehicleNo,
        spot.custMobileNo,
      ].some((field) => field.toLowerCase().includes(term))
    );
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return filtered.slice(start, start + this.itemsPerPage);
  });

  readonly totalPages = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const filteredCount = this.parking().filter((spot) =>
      [
        spot.siteName,
        spot.buildingName,
        spot.floorNo,
        spot.vehicleNo,
        spot.custMobileNo,
      ].some((field) => field.toLowerCase().includes(term))
    ).length;
    return Math.ceil(filteredCount / this.itemsPerPage);
  });

  get pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  ngOnInit() {
    this.loadParking();
  }

  async loadParking() {
    this.isLoading.set(true);
    try {
      const spots = await firstValueFrom(
        this.clientService.getAllParking(
          Number(this.userService.user()?.extraId)
        )
      );
      const sortedSpots = spots.data.sort((a, b) => {
        const site = a.siteName.localeCompare(b.siteName);
        if (site !== 0) return site;
        const building = a.buildingName.localeCompare(b.buildingName);
        if (building !== 0) return building;
        return a.floorNo.localeCompare(b.floorNo);
      });
      this.parking.set(sortedSpots);
    } catch (err) {
      // console.log(err);
    } finally {
      this.isLoading.set(false);
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  exportPDF() {
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const user = this.userService.user()?.emailId;
    const date = new Date();
    const formattedDate = date.toISOString().slice(0, 10);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Unavailable spots', 14, 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${formattedDate}`, 14, 22);
    doc.text(`Printed by: ${user}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [['Site', 'Building', 'Floor', 'VIN', 'Phone']],
      body: this.parking().map((s) => [
        s.siteName,
        s.buildingName,
        s.floorNo,
        s.vehicleNo,
        s.custMobileNo,
      ]),
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 3,
        valign: 'middle',
        lineColor: [200, 200, 200],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [52, 58, 64],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      didDrawPage: (data) => {
        const pages = doc.getNumberOfPages();
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text(
          `Page ${data.pageNumber} of ${pages}`,
          doc.internal.pageSize.getWidth() - 40,
          doc.internal.pageSize.getHeight() - 10
        );
      },
    });
    doc.save(`UnavailableSpots_${formattedDate}.pdf`);
  }
}
