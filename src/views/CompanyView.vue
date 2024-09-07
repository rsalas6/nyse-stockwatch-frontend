<template>
    <Layout>
        <div>
            <div class="flex flex-col sm:flex-row justify-between items-center mb-4 w-full gap-4">
                <h2 class="text-2xl font-semibold">
                    <template v-if="ui.loading">
                        <Skeleton height="2rem" width="15rem" class="mb-2"></Skeleton>
                        <Skeleton height="1rem" width="8rem"></Skeleton>
                    </template>
                    <template v-else>
                        <Button
                            icon="pi pi-arrow-left"
                            text
                            rounded
                            v-tooltip="'Return homepage'"
                            as="router-link"
                            to="/"
                        />
                        {{ form.name }} - <small class="text-gray-400">{{ form.symbol }}</small>
                    </template>
                </h2>

                <InputGroup class="!w-auto ml-auto">
                    <Button
                        icon="pi pi-pencil"
                        severity="primary"
                        :disabled="ui.loading"
                        @click="formShow"
                    />
                    <Button
                        icon="pi pi-trash"
                        severity="danger"
                        :disabled="ui.loading"
                        @click="companyDelete"
                    />
                </InputGroup>
            </div>

            <div class="mb-6">
                <template v-if="ui.loading">
                    <Skeleton height="1.5rem" width="100%" class="mb-2"></Skeleton>
                    <Skeleton height="1.5rem" width="90%" class="mb-2"></Skeleton>
                    <Skeleton height="1.5rem" width="80%" class="mb-2"></Skeleton>
                </template>
                <template v-else>
                    <p class="text-left">{{ form.description }}</p>
                    <div class="chart-container">
                        <Line :data="chart.data" :options="chart.options" />
                    </div>
                </template>
            </div>
        </div>

        <ConfirmDialog></ConfirmDialog>
        <!-- Form Dialog -->
        <Dialog v-model:visible="form.show" modal header="Company Form" :style="{ width: '450px' }">
            <!-- Formulario -->
            <form @submit.prevent="formSubmit" class="max-w-sm mx-auto">
                <!-- Company Symbol -->
                <div class="flex flex-col gap-2">
                    <label for="symbol" class="font-semibold">Symbol</label>
                    <InputGroup>
                        <InputText
                            v-model="form.symbol"
                            maxlength="10"
                            autocomplete="off"
                            placeholder="Enter symbol"
                            disabled
                            @input="form.symbol = form.symbol.toUpperCase()"
                            ref="form.symbol"
                        />
                    </InputGroup>
                </div>

                <!-- Company Name -->
                <div class="flex flex-col gap-2 mt-4">
                    <label for="name" class="font-semibold">Company Name</label>
                    <InputText
                        v-model="form.name"
                        maxlength="50"
                        autocomplete="off"
                        placeholder="Enter company name"
                        :disabled="form.loading"
                        ref="form.name"
                    />
                </div>

                <!-- Company Description -->
                <div class="flex flex-col gap-2 my-4">
                    <label for="description" class="font-semibold">Description</label>
                    <Textarea
                        v-model="form.description"
                        maxlength="100"
                        :autoResize="false"
                        rows="3"
                        placeholder="Enter description"
                        :disabled="form.loading"
                    />
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-end gap-2">
                    <Button
                        type="button"
                        label="Cancel"
                        severity="secondary"
                        @click="form.show = false"
                        :disabled="form.loading"
                    />
                    <Button type="submit" label="Save" :disabled="form.loading" />
                </div>
            </form>
        </Dialog>
    </Layout>
</template>

<script>
import Layout from '@/components/Layout.vue';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'vue-chartjs';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default {
    components: {
        Layout,
        Line
    },
    data() {
        return {
            ui: {
                loading: true
            },
            form: {
                id: null,
                show: false,
                symbol: null,
                name: null,
                description: null,
                loading: false,
                disable: {
                    symbol: false,
                    symbolSearch: false
                }
            },
            chart: {
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Closing Price',
                            backgroundColor: '#42A5F5',
                            borderColor: '#42A5F5',
                            data: []
                        },
                        {
                            label: 'Opening Price',
                            backgroundColor: '#66BB6A',
                            borderColor: '#66BB6A',
                            data: [] // Datos de apertura
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                color: '#FFFFFF'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Market Data (Last 7 Days)',
                            color: '#FFFFFF'
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: '#FFFFFF',
                                maxRotation: 0,
                                minRotation: 0
                            },
                            grid: {
                                color: '#444'
                            }
                        },
                        y: {
                            ticks: {
                                color: '#FFFFFF'
                            },
                            grid: {
                                color: '#444'
                            }
                        }
                    }
                }
            }
        };
    },
    methods: {
        async load() {
            try {
                this.ui.loading = true;
                const res = await this.$api.get(
                    `/api/v1/companies/${this.$route.params.uuid}/?market`
                );
                if (res.status === 200) {
                    setTimeout(async () => {
                        this.form.name = res.data.name;
                        this.form.symbol = res.data.symbol;
                        this.form.description = res.data.description;

                        const marketData = res.data.market_data;

                        this.chart.data.labels = marketData.map((data) => data.datetime).reverse();
                        this.chart.data.datasets[0].data = marketData
                            .map((data) => data.close)
                            .reverse();
                        this.chart.data.datasets[1].data = marketData
                            .map((data) => data.open)
                            .reverse();
                        this.ui.loading = false;
                    }, 300);
                }
            } catch (error) {
                this.error = error.message || 'Error fetching companies';
                this.ui.loading = false;
            }
        },
        companyDelete() {
            this.$confirm.require({
                message: `Are you sure you want to delete ${this.form.name} (${this.form.symbol})?`,
                header: 'Confirmation',
                icon: 'pi pi-exclamation-triangle',
                rejectProps: {
                    label: 'Cancel',
                    severity: 'secondary',
                    outlined: true
                },
                acceptProps: {
                    label: 'Delete',
                    severity: 'danger'
                },
                accept: async () => {
                    try {
                        const res = await this.$api.delete(`/api/v1/companies/${this.form.id}/`);
                        if (res.status === 204) {
                            this.$router.push('/');
                            this.$nextTick(() => {
                                setTimeout(() => {
                                    this.$toast.add({
                                        severity: 'success',
                                        summary: 'Company deleted',
                                        detail: `You have deleted ${this.form.name} (${this.form.symbol}) company`,
                                        life: 3000
                                    });
                                }, 100);
                            });
                        }
                    } catch (error) {
                        this.$toast.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'An error occurred while processing your request. Please try again later.',
                            life: 3000
                        });
                    }
                },
                reject: () => {}
            });
        },
        companyEdit(company) {
            this.form.id = company.id;
            this.form.symbol = company.symbol;
            this.form.name = company.name;
            this.form.description = company.description;
            this.form.disable.symbol = true;
            this.form.disable.symbolSearch = true;
            this.form.show = true;
        },

        // Form methods
        formShow() {
            this.form.show = true;
        },
        formReset() {
            this.form.id = null;
            this.form.symbol = null;
            this.form.name = null;
            this.form.description = null;
            this.form.disable.symbol = false;
            this.form.disable.symbolSearch = false;
        },
        async formSubmit() {
            if (this.form.symbol === null || this.form.symbol.length === 0) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'The symbol field cannot be empty.',
                    life: 3000
                });
                this.$refs['form.symbol'].$el.focus();
                return;
            }

            if (this.form.name === null || this.form.name.length === 0) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'The name field cannot be empty.',
                    life: 3000
                });
                this.$refs['form.symbol'].$el.focus();
                return;
            }

            try {
                this.form.loading = true;

                const formData = new FormData();
                formData.append('name', this.form.name);
                formData.append('symbol', this.form.symbol);
                formData.append('description', this.form.description);

                const res = await this.$api.put(`/api/v1/companies/${this.form.id}/`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (res.status === 200 || res.status === 201) {
                    this.$toast.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'The new company has been successfully added.',
                        life: 3000
                    });
                    this.load();
                    this.form.show = false;
                }
            } catch (error) {
                console.log(error);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response?.data?.detail || 'Unexpected error.',
                    life: 3000
                });

                if (error.response?.data?.error === 'duplicated') {
                    this.filters.searchField = 'by_symbol';
                    this.filters.search = this.form.symbol;
                    this.load();
                }
            } finally {
                this.form.loading = false;
            }
        },
        async formLoadSymbol() {
            if (this.form.symbol === null || this.form.symbol.length === 0) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'The symbol field cannot be empty. Please provide a valid symbol to search.',
                    life: 3000
                });

                return;
            }

            try {
                this.form.loading = true;
                const res = await this.$api.get(
                    `/api/v1/companies/external/${this.form.symbol.toUpperCase()}/`
                );
                if (res.status === 200) {
                    // this.$toast.add({
                    //     severity: 'success',
                    //     summary: 'Success',
                    //     detail: 'The symbol was found and the form has been completed automatically.',
                    //     life: 3000
                    // });

                    if (res.data.exchange !== 'NYSE') {
                        this.$toast.add({
                            severity: 'warn',
                            summary: 'Warning',
                            detail: 'The selected exchange does not belong to NYSE. Please verify the exchange.',
                            life: 3000
                        });
                    }

                    this.form.name = res.data.name;
                    this.form.description = `Currency: ${res.data.currency}\nVolume: ${res.data.volume}\nExchange: ${res.data.exchange}`;
                }
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response?.data?.detail || 'Unexpected error.',
                    life: 3000
                });
            } finally {
                this.form.loading = false;
            }
        }
    },
    async mounted() {
        this.form.id = this.$route.params.uuid;
        await this.load();
    }
};
</script>

<style>
.p-card-body {
    min-height: 250px;
    height: 100%;
    justify-content: space-between;
}

.company-button-delete {
    position: absolute !important;
}

.chart-container {
    width: 100%;
    height: 400px;
}
</style>
