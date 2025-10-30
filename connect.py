import psycopg2

def main():
    try:
        # Attempt to connect to the PostgreSQL database
        conn = psycopg2.connect(
            'postgres://avnadmin:AVNS_4NMugWcbAOIjkUAmCn7@sjbu-v-anthonyphiri533-0f2d.d.aivencloud.com:24897/defaultdb?sslmode=require'
        )
        print("✅ Database connection successful. The DB is up and running!")

    except Exception as e:
        print("❌ Failed to connect to the database:", e)

    finally:
        if 'conn' in locals() and conn:
            conn.close()
            print("Connection closed.")

if __name__ == "__main__":
    main()
