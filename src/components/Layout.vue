<template>
    <div class="flex flex-col mx-auto size-full">
        <header
            class="mb-auto flex flex-wrap justify-center sm:justify-start sm:flex-nowrap z-50 w-full text-sm py-4"
        >
            <nav class="w-full px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
                <div class="flex items-center justify-center sm:justify-between w-full sm:w-auto">
                    <a
                        class="text-xl font-semibold text-white focus:outline-none focus:opacity-80"
                        href="#"
                        aria-label="Brand"
                    >
                        NYSE StockWatch
                    </a>
                </div>
                <div id="hs-navbar-cover-page" class="grow sm:block">
                    <div
                        class="flex flex-col items-center gap-5 mt-5 sm:flex-row sm:items-center sm:justify-end sm:mt-0 sm:ps-5"
                    >
                        <router-link
                            class="font-medium text-white focus:outline-none"
                            to="/"
                            aria-current="page"
                        >
                            Home
                        </router-link>
                        <router-link
                            class="font-medium text-white/70 hover:text-white focus:outline-none focus:text-white"
                            to="/about"
                        >
                            About
                        </router-link>
                        <a
                            v-tooltip.bottom="'Redoc documentation'"
                            class="font-medium text-white/70 hover:text-white focus:outline-none focus:text-white"
                            href="https://nyse-api.beto.page/redoc/"
                            target="_blank"
                        >
                            Redoc API Docs
                        </a>
                        <a
                            v-tooltip.bottom="'Backend repository'"
                            class="font-medium text-white/70 hover:text-white focus:outline-none focus:text-white flex items-center"
                            href="https://github.com/rsalas6/nyse-stockwatch-backend"
                            target="_blank"
                        >
                            <i class="pi pi-github mr-2"></i>
                        </a>
                        <a
                            v-tooltip.bottom="'Frontend repository'"
                            class="font-medium text-white/70 hover:text-white focus:outline-none focus:text-white flex items-center"
                            href="https://github.com/rsalas6/nyse-stockwatch-frontend"
                            target="_blank"
                        >
                            <i class="pi pi-github mr-2"></i>
                        </a>
                        <Button :icon="`pi ${icon}`" class="text-white/70 hover:text-white !px-0 w-2" text rounded size="small" @click="visible = true;" />
                    </div>
                </div>
            </nav>
        </header>

        <main>
            <div class="container py-10 px-4 sm:px-6 lg:px-8 lg:min-w-[1240px] max-w-full">
                <template v-if="tokenValid === true">
                    <slot></slot>
                </template>
            </div>
        </main>

        <footer class="mt-auto text-center py-5">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p class="text-sm text-white/70">
                    Made with ♥ by
                    <a
                        class="text-white decoration-2 underline underline-offset-2 font-medium hover:text-gray-200 hover:decoration-white/70 focus:outline-none focus:text-gray-200 focus:decoration-white/70"
                        href="https://beto.page"
                        target="_blank"
                    >
                        Beto
                    </a>
                </p>
            </div>
        </footer>
        <Toast position="bottom-right" />
        <Dialog v-model:visible="visible" modal header="Enter API Token" :style="{ width: '25rem' }">
            <span class="text-surface-500 dark:text-surface-400 block mb-8">
                Please enter your API token to proceed.
            </span>
            <div class="flex items-center gap-4 mb-4">
                <label for="token" class="font-semibold w-24">Token</label>
                <InputText v-model="token" id="token" class="flex-auto" autocomplete="off" />
            </div>
            <div class="flex justify-end gap-2">
                <Button type="button" label="Cancel" severity="secondary" @click="visible = false"></Button>
                <Button type="button" label="Save" @click="validateToken"></Button>
            </div>
        </Dialog>
    </div>
</template>

<script>
export default {
    name: 'Layout',
    data() {
        return {
            visible: false,
            token: null,
            tokenValid: false,
            icon: 'pi-lock'
        };
    },
    mounted() {
        const savedToken = localStorage.getItem('api_token');
        if (savedToken) {
            this.token = savedToken;
            if (this.tokenValid === false) {
                this.validateToken();
            }
        } else {
            this.visible = true;
        }
    },
    methods: {
        async validateToken() {
            if (!this.token || this.token.length === 0) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Invalid Token',
                    detail: 'You need to provide a valid token. Please try again.',
                    life: 3000
                });
                return;
            }

            try {
                localStorage.setItem('api_token', this.token);
                const res = await this.$api.get('/api/v1/companies/validate-token/');

                if (res.status === 200) {

                    this.tokenValid = true;
                    this.visible = false;
                    this.icon = 'pi-lock-open';
                    this.$forceUpdate();
                } else {
                    this.invalidateToken();
                }
            } catch (error) {
                this.invalidateToken();
            }
        },
        invalidateToken() {
            localStorage.removeItem('api_token');
            this.token = null;
            this.tokenValid = false;
            this.visible = true;
            this.$toast.add({
                severity: 'error',
                summary: 'Invalid Token',
                detail: 'The token provided is invalid. Please provide a valid token.',
                life: 3000
            });
        }
    }
};
</script>


