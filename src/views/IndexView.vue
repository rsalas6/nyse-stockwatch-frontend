<template>
    <Layout>
        <div>
            <div class="flex flex-col sm:flex-row justify-between items-center mb-4 w-full gap-4">
                <h2 class="text-xl font-semibold">{{ ui.title }}</h2>

                <form
                    @submit.prevent="filterLoad"
                    class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                >
                    <div class="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
                        <!-- Search Input -->
                        <InputGroup class="w-full sm:w-auto">
                            <Select
                                v-model="filters.searchField"
                                :options="searchOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Search by"
                                class="w-full sm:w-auto max-w-36"
                                :disabled="ui.loading"
                            />
                            <InputText
                                v-model="filters.search"
                                placeholder="Search companies..."
                                class="w-full sm:w-auto"
                                type="search"
                                :disabled="ui.loading"
                                ref="search"
                            />
                            <Button
                                icon="pi pi-search"
                                severity="primary"
                                class="w-full sm:w-auto"
                                :disabled="!filters.search.length > 0 || ui.loading"
                                type="submit"
                            />
                        </InputGroup>

                        <!-- Sort Input -->
                        <InputGroup class="w-full sm:w-auto lg:max-w-40">
                            <Select
                                v-model="filters.sortBy"
                                :options="sortOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Sort by"
                                :disabled="ui.loading"
                                @change="filterLoad"
                                class="w-full"
                            />
                            <Button
                                :icon="
                                    filters.sortDirection === 'asc'
                                        ? 'pi pi-sort-alpha-down'
                                        : 'pi pi-sort-alpha-up'
                                "
                                severity="primary"
                                class="w-full sm:w-auto"
                                :disabled="ui.loading"
                                @click="toggleSortDirection"
                            />
                        </InputGroup>

                        <!-- Additional Actions -->
                        <InputGroup class="!w-auto ml-auto">
                            <Button
                                icon="pi pi-undo"
                                severity="primary"
                                :disabled="ui.loading"
                                @click="reset"
                            />
                            <Button
                                icon="pi pi-plus"
                                severity="primary"
                                :disabled="ui.loading"
                                @click="
                                    formReset();
                                    formShow();
                                "
                            />
                        </InputGroup>
                    </div>
                </form>
            </div>

            <!-- Companies Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Loading Skeleton -->
                <template v-if="ui.loading">
                    <Card
                        v-for="n in ui.loadingCount"
                        :key="n"
                        class="flex flex-col justify-between h-full p-4 relative w-full"
                    >
                        <template #title>
                            <Skeleton width="100%" height="1.5rem" />
                        </template>
                        <template #subtitle>
                            <Skeleton width="100%" height="1.5rem" />
                        </template>
                        <template #content>
                            <p class="m-0 flex-grow">
                                <Skeleton width="100%" height="4rem" />
                            </p>
                        </template>
                        <template #footer>
                            <div class="flex mt-4">
                                <Skeleton width="100%" height="2rem" />
                            </div>
                        </template>
                    </Card>
                </template>

                <!-- Companies List -->
                <template v-else-if="companies.data.length > 0">
                    <Card
                        v-for="company in companies.data"
                        :key="company.id"
                        class="flex flex-col justify-between h-full p-4 relative"
                    >
                        <template #title>
                            {{ company.name }}
                        </template>
                        <template #subtitle>
                            {{ company.symbol }}
                        </template>
                        <template #content>
                            <p class="m-0 flex-grow">{{ company.description }}</p>
                            <Button
                                class="company-button-delete top-2 right-2"
                                icon="pi pi-trash"
                                severity="danger"
                                text
                                rounded
                                aria-label="Delete"
                                @click="companyDelete(company)"
                                v-tooltip="'Delete company'"
                            ></Button>
                            <Button
                                class="company-button-delete top-2 left-2"
                                icon="pi pi-pencil"
                                severity="success"
                                text
                                rounded
                                aria-label="Delete"
                                @click="companyEdit(company)"
                                v-tooltip="'Delete company'"
                            ></Button>
                        </template>
                        <template #footer>
                            <div class="flex mt-4">
                                <Button
                                    icon="pi pi-chart-line"
                                    as="router-link"
                                    class="!w-full !block"
                                    :to="`/company/${company.id}/`"
                                />
                            </div>
                        </template>
                    </Card>
                </template>
            </div>

            <!-- No Results Found -->
            <div class="flex justify-center items-center h-full" v-if="companies.data.length === 0">
                <div class="text-center p-6">
                    <h3 class="text-xl font-semibold text-gray-500">No results found</h3>
                    <p class="text-gray-400">
                        Try adjusting your search or filters to find what you're looking for.
                    </p>
                </div>
            </div>

            <!-- Paginator -->
            <div class="mt-6 w-full">
                <Paginator
                    :rows="companies.per_page"
                    :totalRecords="companies.total"
                    :first="(companies.page - 1) * companies.per_page"
                    :rowsPerPageOptions="[9, 18, 27, 45]"
                    class="w-full"
                    @page="onPageChange"
                />
            </div>
        </div>
        <ConfirmDialog></ConfirmDialog>

        <!-- Form Dialog -->
        <Dialog v-model:visible="form.show" modal header="Company Form" :style="{ width: '450px' }">
            <!-- @hide="formReset" -->
            <!-- <span class="text-surface-500 dark:text-surface-400 block mb-8">Add or update company details.</span> -->

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
                            :disabled="form.loading || form.disable.symbol"
                            @input="form.symbol = form.symbol.toUpperCase()"
                            ref="form.symbol"
                        />
                        <Button
                            icon="pi pi-search"
                            :disabled="form.loading || form.disable.symbolSearch"
                            @click="formLoadSymbol"
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

export default {
    components: {
        Layout
    },
    data() {
        return {
            ui: {
                title: 'Companies List',
                loading: true,
                loadingCount: 9
            },
            filters: {
                search: '',
                searchField: 'in_all',
                sortBy: 'name',
                sortDirection: 'asc'
            },
            searchOptions: [
                { label: 'Search in all Fields', value: 'in_all' },
                { label: 'Search in Name', value: 'in_name' },
                { label: 'Search in Symbol', value: 'in_symbol' },
                { label: 'Search in Description', value: 'in_description' },
                { label: 'Search by Symbol', value: 'by_symbol' }
            ],
            sortOptions: [
                { label: 'Sort by Name', value: 'name' },
                { label: 'Sort by Symbol', value: 'symbol' }
            ],
            companies: {
                page: 1,
                per_page: 9,
                total: 0,
                data: []
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
            }
        };
    },
    methods: {
        async load() {
            try {
                this.ui.loading = true;
                this.ui.loadingCount = this.companies.per_page;
                const params = {
                    page: this.companies.page,
                    per_page: this.companies.per_page,
                    search_field: this.filters.searchField,
                    sort_by: this.filters.sortBy,
                    sort_direction: this.filters.sortDirection
                };

                if (this.filters.search.trim() !== '') {
                    params.search = this.filters.search;
                }

                const res = await this.$api.get('/api/v1/companies/', { params });
                if (res.status === 200) {
                    setTimeout(() => {
                        this.companies.data = res.data.results;
                        this.companies.total = res.data.count;
                        if (res.data.count > 0) {
                            this.ui.title = `Companies List - ${this.companies.total} records found`;
                        } else {
                            this.ui.title = `Companies List - No records found`;
                        }
                        this.ui.loading = false;
                    }, 300);
                }
            } catch (error) {
                this.error = error.message || 'Error fetching companies';
                this.ui.loading = false;
            }
        },
        companyDelete(company) {
            this.$confirm.require({
                message: `Are you sure you want to delete ${company.name} (${company.symbol})?`,
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
                        const res = await this.$api.delete(`/api/v1/companies/${company.id}/`);
                        if (res.status === 204) {
                            this.$toast.add({
                                severity: 'success',
                                summary: 'Company deleted',
                                detail: `You have deleted ${company.name} (${company.symbol}) company`,
                                life: 3000
                            });
                        }
                    } catch (error) {
                        this.$toast.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'An error occurred while processing your request. Please try again later.',
                            life: 3000
                        });
                    } finally {
                        this.load();
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
        reset() {
            this.filters.search = '';
            this.filters.searchField = 'in_all';
            this.filters.sortBy = 'name';
            this.filters.sortDirection = 'asc';

            this.companies.page = 1;
            this.companies.per_page = 9;

            this.load();
        },
        filterLoad() {
            this.companies.page = 1;
            this.load();
        },
        toggleSortDirection() {
            this.filters.sortDirection = this.filters.sortDirection === 'asc' ? 'desc' : 'asc';
            this.load();
        },
        onPageChange(event) {
            if (event.rows !== this.companies.per_page) {
                this.companies.page = 1;
            } else {
                this.companies.page = Math.floor(event.first / event.rows) + 1;
            }
            this.companies.per_page = event.rows;
            this.ui.loadingCount = this.companies.per_page;
            this.load();
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
                let apiMethod = this.$api.post;
                let apiUrl = `/api/v1/companies/`;
                if (this.form.id !== null) {
                    apiUrl = `/api/v1/companies/${this.form.id}/`;
                    apiMethod = this.$api.put;
                }

                const formData = new FormData();
                formData.append('name', this.form.name);
                formData.append('symbol', this.form.symbol);
                formData.append('description', this.form.description);

                const res = await apiMethod(apiUrl, formData, {
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

                    this.filters.searchField = 'by_symbol';
                    this.filters.search = this.form.symbol;
                    this.load();
                    this.formReset();
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
</style>
