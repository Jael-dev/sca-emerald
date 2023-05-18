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
            <v-col class="ma-n4 pa-0" v-for="i in 3" :key="i" >
              <!-- <v-btn icon="fa-solid fa-check" size="x-small" variant="plain" color="black">
                
              </v-btn> -->
              <v-btn icon="fa-brands fa-square-whatsapp" variant="plain" color="red"></v-btn>
            </v-col>
          </v-row>
        </v-container>
    </v-app-bar>
    <v-main class="bg-grey-lighten-3">
      <v-container>
        <v-row>
          <v-col cols="2">
            <v-sheet rounded="lg">
              <v-list rounded="lg">
                <v-list-item v-for="n in 5" :key="n" link>
                  <v-list-item-title>
                    List Item {{ n }}
                  </v-list-item-title>
                </v-list-item>

                <v-divider class="my-2"></v-divider>

                <v-list-item link color="grey-lighten-4">
                  <v-list-item-title>
                    Refresh
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-sheet>
          </v-col>

          <v-col>
            <v-sheet min-height="70vh" rounded="lg">
              <!--  -->
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  data: () => ({
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
}
</script>