import { animate, state, style, transition, trigger } from "@angular/animations";
import { ConnectedPosition } from "@angular/cdk/overlay";
import { Component, EventEmitter, OnInit, Output } from "@angular/core";

import { VaultFilter } from "jslib-angular/modules/vault-filter/models/vault-filter.model";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { Organization } from "jslib-common/models/domain/organization";

import { VaultFilterService } from "../../services/vaultFilter.service";

@Component({
  selector: "app-vault-select",
  templateUrl: "vault-select.component.html",
  animations: [
    trigger("transformPanel", [
      state(
        "void",
        style({
          opacity: 0,
        })
      ),
      transition(
        "void => open",
        animate(
          "100ms linear",
          style({
            opacity: 1,
          })
        )
      ),
      transition("* => void", animate("100ms linear", style({ opacity: 0 }))),
    ]),
  ],
})
export class VaultSelectComponent implements OnInit {
  @Output() onVaultSelectionChanged = new EventEmitter();

  isOpen = false;
  loaded = false;
  showOrganizations = false;
  organizations: Organization[];
  vaultFilter: VaultFilter = new VaultFilter();
  vaultFilterDisplay = "";
  enforcePersonalOwnwership = false;
  overlayPostition: ConnectedPosition[] = [
    {
      originX: "start",
      originY: "bottom",
      overlayX: "start",
      overlayY: "top",
    },
  ];

  constructor(private vaultFilterService: VaultFilterService, private i18nService: I18nService) {}

  async ngOnInit() {
    this.vaultFilter = this.vaultFilterService.getVaultFilter();
    this.organizations = await this.vaultFilterService.buildOrganizations();
    this.enforcePersonalOwnwership =
      await this.vaultFilterService.checkForPersonalOwnershipPolicy();

    if (
      (!this.enforcePersonalOwnwership && this.organizations.length > 0) ||
      (this.enforcePersonalOwnwership && this.organizations.length > 1)
    ) {
      this.showOrganizations = true;

      if (this.enforcePersonalOwnwership && !this.vaultFilter.myVaultOnly) {
        this.vaultFilterService.setVaultFilter(this.organizations[0].id);
        this.vaultFilter.selectedOrganizationId = this.organizations[0].id;
        this.vaultFilterDisplay = this.organizations.find(
          (o) => o.id === this.vaultFilter.selectedOrganizationId
        ).name;
      } else if (this.vaultFilter.myVaultOnly) {
        this.vaultFilterDisplay = this.i18nService.t(this.vaultFilterService.myVault);
      } else if (this.vaultFilter.selectedOrganizationId != null) {
        this.vaultFilterDisplay = this.organizations.find(
          (o) => o.id === this.vaultFilter.selectedOrganizationId
        ).name;
      } else {
        this.vaultFilterDisplay = this.i18nService.t(this.vaultFilterService.allVaults);
      }
    }
    this.loaded = true;
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  close() {
    this.isOpen = false;
  }

  selectOrganization(organization: Organization) {
    this.vaultFilterDisplay = organization.name;
    this.vaultFilterService.setVaultFilter(organization.id);
    this.onVaultSelectionChanged.emit();
    this.close();
  }
  selectAllVaults() {
    this.vaultFilterDisplay = this.i18nService.t(this.vaultFilterService.allVaults);
    this.vaultFilterService.setVaultFilter(this.vaultFilterService.allVaults);
    this.onVaultSelectionChanged.emit();
    this.close();
  }
  selectMyVault() {
    this.vaultFilterDisplay = this.i18nService.t(this.vaultFilterService.myVault);
    this.vaultFilterService.setVaultFilter(this.vaultFilterService.myVault);
    this.onVaultSelectionChanged.emit();
    this.close();
  }
}