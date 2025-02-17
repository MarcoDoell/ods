<template>
  <div v-if="!isLoading">
    <v-stepper v-model="dialogStep" vertical>
      <v-stepper-step :complete="dialogStep > 1" step="1">
        Datasource Name
        <small>Choose a name to display the datasource</small>
      </v-stepper-step>
      <v-stepper-content step="1">
        <v-form v-model="validStep1">
          <v-text-field
            v-model="datasource.metadata.displayName"
            label="Datasource Name"
            :rules="[required]"
          />
        </v-form>
        <stepper-button-group
          :step="1"
          :next-enabled="validStep1"
          :previous-visible="false"
          @stepChanged="dialogStep = $event"
        />
      </v-stepper-content>

      <v-stepper-step :complete="dialogStep > 2" step="2">
        Adapter Configuration
        <small>Configure the data import</small>
      </v-stepper-step>
      <v-stepper-content step="2">
        <adapter-config
          v-model="datasource"
          @validityChanged="validStep2 = $event"
        />
        <stepper-button-group
          :step="2"
          :next-enabled="validStep2"
          @stepChanged="dialogStep = $event"
        />
      </v-stepper-content>
      <v-stepper-step v-if="isSchemaAlive" :complete="dialogStep > 3" step="3">
        Generated schema
        <small>Customize the generated schema </small>
      </v-stepper-step>
      <v-stepper-content v-if="isSchemaAlive" step="3">
        <datasource-schema-edit
          v-model="datasource"
          @validityChanged="validStep3 = $event"
        />
        <stepper-button-group
          :step="3"
          :next-enabled="validStep3"
          @stepChanged="dialogStep = $event"
        />
      </v-stepper-content>

      <v-stepper-step
        :complete="dialogStep > metaDataStepNumber"
        :step="metaDataStepNumber"
      >
        Meta-Data
      </v-stepper-step>
      <v-stepper-content :step="metaDataStepNumber">
        <datasource-metadata-config
          v-model="datasource.metadata"
          @validityChanged="validStep4 = $event"
        />
        <stepper-button-group
          :step="metaDataStepNumber"
          :next-enabled="validStep4"
          @stepChanged="dialogStep = $event"
        />
      </v-stepper-content>

      <v-stepper-step
        :complete="dialogStep > triggerConfigurationStepNumber"
        :step="triggerConfigurationStepNumber"
      >
        Trigger Configuration
        <small>Configure Execution Details</small>
      </v-stepper-step>
      <v-stepper-content :step="triggerConfigurationStepNumber">
        <trigger-config
          v-model="datasource.trigger"
          @validityChanged="validStep5 = $event"
        />
        <stepper-button-group
          :step="triggerConfigurationStepNumber"
          :next-enabled="validStep5"
          :next-visible="false"
          @stepChanged="dialogStep = $event"
        />
      </v-stepper-content>
    </v-stepper>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit, PropSync, Watch } from 'vue-property-decorator';

import StepperButtonGroup from '../components/StepperButtonGroup.vue';
import { requiredRule } from '../validators';

import Datasource from './datasource';
import AdapterConfig from './edit/adapter/AdapterConfig.vue';
import DatasourceMetadataConfig from './edit/DatasourceMetadataConfig.vue';
import DatasourceSchemaEdit from './edit/schema/DatasourceSchemaEdit.vue';
import TriggerConfig from './edit/TriggerConfig.vue';
import * as SchemaSuggestionREST from './schemaSuggestionRest';

@Component({
  components: {
    AdapterConfig,
    StepperButtonGroup,
    DatasourceMetadataConfig,
    TriggerConfig,
    DatasourceSchemaEdit,
  },
})
export default class DatasourceForm extends Vue {
  private dialogStep = 1;
  private validStep1 = false;
  private validStep2 = true; // Starts with valid default values
  private validStep3 = true; // Starts with valid default values
  private validStep4 = true; // Starts with valid default values
  private validStep5 = true; // Starts with valid default values

  @PropSync('value')
  private datasource: Datasource | undefined;

  private isSchemaAlive = false;
  private required = requiredRule;

  mounted(): void {
    void this.updateIsSchemaAlive();
  }

  get isLoading(): boolean {
    return this.datasource === undefined;
  }

  private async updateIsSchemaAlive(): Promise<void> {
    this.isSchemaAlive = (await SchemaSuggestionREST.getIsAlive()) === 'alive';
  }

  get isValid(): boolean {
    return (
      this.validStep1 &&
      this.validStep2 &&
      this.validStep3 &&
      this.validStep4 &&
      this.validStep5
    );
  }

  get metaDataStepNumber(): number {
    return this.isSchemaAlive ? 4 : 3;
  }

  get triggerConfigurationStepNumber(): number {
    return this.isSchemaAlive ? 5 : 4;
  }

  @Emit('validityChanged')
  private emitIsValid(): boolean {
    return this.isValid;
  }

  @Watch('isValid')
  private onIsValidChanged(): void {
    this.emitIsValid();
  }
}
</script>
