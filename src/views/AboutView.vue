<template>
    <Layout>
        <div>
            <div class="flex flex-col sm:flex-row justify-between items-center mb-4 w-full gap-4">
                <h2 class="text-xl font-semibold">About</h2>
            </div>
            <div class="mb-6">
                <p class="text-left">
                    This demo application, developed by
                    <a href="https://beto.page" target="_blank" rel="noopener noreferrer"
                        >Roberto Salas</a
                    >, is built on top of Django Rest Framework and allows users to manage companies
                    based on validated stock symbols from an external API. Only companies that are
                    officially registered with the external API can be added, ensuring the accuracy
                    of the stock data. Users cannot add companies that are not already registered.
                </p>
                <p class="text-left">
                    In the app, users can create, edit, and delete companies, filter companies by
                    any field, and sort them in ascending or descending order. The name and
                    description fields are user-defined and not validated externally, allowing
                    flexibility for these fields. In contrast, the stock symbol is always verified
                    before a company is added.
                </p>
                <p class="text-left">
                    Additionally, the application features a 7-day performance chart, where users
                    can visualize how the stock has performed over the past week. This is a key
                    feature for those who want to track recent market trends.
                </p>
                <p class="text-left">
                    The demo includes a responsive user interface with a focus on usability. Other
                    functionalities include search, sorting, and data validation through integration
                    with external APIs to ensure the latest stock market data is available.
                </p>
            </div>
        </div>
    </Layout>
</template>

<script>
import Layout from '@/components/Layout.vue';

export default {
    components: {
        Layout
    },
    data() {
        return {};
    }
};
</script>

<style></style>
