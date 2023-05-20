<template>
  <v-app id="inspire">

    <v-app-bar flat>
      <v-container class="fill-height d-flex align-center">
        <v-avatar class="me-10 ms-4" color="grey-darken-1" size="32">JK</v-avatar>
        <v-spacer></v-spacer>
        <v-row>
          <v-col class="ms-auto" v-for="link in links" :key="link">
            <v-btn variant="plain">
              {{ link }}
            </v-btn>
          </v-col>

        </v-row>
        <v-spacer></v-spacer>

        <v-row align="space-around" no-gutters="true" dense="true">
          <v-spacer></v-spacer>
          <v-col class="ma-n4 pa-0" v-for="i in 3" :key="i">
            <v-btn icon="fa-solid fa-check" size="x-small" variant="plain" color="black">

            </v-btn>
            <v-btn icon="fa-brands fa-square-whatsapp" variant="plain" color="red"></v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-app-bar>
    <v-main class="bg-grey-lighten-3">
      <v-container>
        <v-row>


          <v-col>


            <v-row>
              <v-col v-for="n in 9" :key="n" class="d-flex child-flex" cols="4">
                <v-img :src="`https://picsum.photos/500/300?image=${n * 5 + 10}`"
                  :lazy-src="`https://picsum.photos/10/6?image=${n * 5 + 10}`" aspect-ratio="1" cover
                  class="bg-grey-lighten-2">
                  <template v-slot:placeholder>
                    <v-row class="fill-height ma-0" align="center" justify="center">
                      <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
                    </v-row>
                  </template>
                </v-img>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    categories: {},
    links: [
      'Acceuil',
      'Blog',
      'Catégories',
      'Contacter',
    ],
    social: [
      'Acceuil',
      'Blog',
      'Catégories',
      'Contacter',
    ],
  }),
  created() {
    this.getList(); // NEW - call getEventData() when the instance is created
  },
  methods: {
    async getList() {
      await this.axios.get("http://localhost:8001/category").then((response) => {
        this.categories =response.data
        console.log(this.categories)
      })
    }
  }
}
</script>