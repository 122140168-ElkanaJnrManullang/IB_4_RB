import sys
import json
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report

# --- Load dataset untuk training model ---
# Pastikan path ke dataset 'bmi.xlsx' benar
bmi_data = pd.read_excel('datasets/bmi.xlsx')  # Path sesuai
bmi_data.columns = ["age", "height", "weight", "Bmi", "BmiClass", "Gender"]
bmi_data = bmi_data.drop(0).reset_index(drop=True)

# Konversi tinggi badan ke meter
bmi_data['height'] = bmi_data['height'].astype(float) / 100

# Hitung ulang BMI (opsional, jika ingin memastikan BMI di dataset benar)
bmi_data['Bmi'] = bmi_data['weight'] / (bmi_data['height'] ** 2)

# Pisahkan fitur dan target
X = bmi_data[['age', 'height', 'weight']].astype(float)
y = bmi_data['BmiClass']

# Split data menjadi training set dan testing set
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale fitur menggunakan StandardScaler
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# --- Train model KNN ---
knn = KNeighborsClassifier(n_neighbors=5)  # Gunakan 5 nearest neighbors
knn.fit(X_train_scaled, y_train)  # Latih model dengan data training

# --- Evaluasi model ---
y_pred = knn.predict(X_test_scaled)  # Prediksi kelas BMI pada data testing
accuracy = accuracy_score(y_test, y_pred)  # Hitung akurasi
classification_rep = classification_report(y_test, y_pred)  # Generate classification report

# --- Load dataset makanan dan olahraga ---
# Pastikan path ke dataset 'makanan.xlsx' dan 'olahraga.xlsx' benar
food_data = pd.read_excel('datasets/makanan.xlsx')  # Path sesuai
sports_data = pd.read_excel('datasets/olahraga.xlsx')  # Path sesuai

# --- Fungsi untuk menghitung BMI dan memberikan rekomendasi ---
def calculate_bmi_and_recommend(age, height, weight, food_data, sports_data):
    height_m = height / 100
    bmi = weight / (height_m ** 2)

    # Prediksi BMI Class
    input_data = pd.DataFrame([[age, height, weight]], columns=['age', 'height', 'weight'])
    input_data_scaled = scaler.transform(input_data)
    bmi_class = knn.predict(input_data_scaled)[0]

    # --- Rekomendasi makanan berdasarkan BMI ---
    # Sesuaikan logika dan nama kolom dengan dataset 'makanan.xlsx'
    food_recommendations = None
    if bmi_class == "Kurus":
        food_recommendations = food_data[food_data['BMI'] == 'Kurus'][['Waktu Makan', 'Saran Makanan', 'Porsi','Berat (gram)']].head(21)
    elif bmi_class == "Ideal":
        # ... (dst. sesuaikan dengan dataset makanan)
        food_recommendations = food_data[food_data['BMI'] == 'Ideal'][['Waktu Makan', 'Saran Makanan', 'Porsi','Berat (gram)']].head(21)
    elif bmi_class == "Gemuk":
        food_recommendations = food_data[food_data['BMI'] == 'Gemuk'][['Waktu Makan', 'Saran Makanan', 'Porsi','Berat (gram)']].head(21)
    elif bmi_class == "Obesitas":
        food_recommendations = food_data[food_data['BMI'] == 'Obesitas'][['Waktu Makan', 'Saran Makanan', 'Porsi','Berat (gram)']].head(21)
    # ...

    # --- Rekomendasi olahraga berdasarkan BMI ---
    # Sesuaikan logika dan nama kolom dengan dataset 'olahraga.xlsx'
    sports_recommendations = None
    if bmi_class == "Kurus":
        sports_recommendations = sports_data[sports_data['Difficulty Level'] == 'Beginner'][['Name of Exercise', 'Sets', 'Reps', 'Burns Calories (per 30 min)']].head(5)
    elif bmi_class == "Ideal":
        sports_recommendations = sports_data[sports_data['Difficulty Level'] == 'Intermediate'][['Name of Exercise', 'Sets', 'Reps', 'Burns Calories (per 30 min)']].head(5)
    elif bmi_class == "Gemuk":
        sports_recommendations = sports_data[sports_data['Difficulty Level'] == 'Beginner'][['Name of Exercise', 'Sets', 'Reps', 'Burns Calories (per 30 min)']].head(5)
    elif bmi_class == "Obesitas":
        sports_recommendations = sports_data[sports_data['Difficulty Level'] == 'Intermediate'][['Name of Exercise', 'Sets', 'Reps', 'Burns Calories (per 30 min)']].head(5)
    # ...

    print("food_data:\n", food_data)
    print("sports_data:\n", sports_data)
    print("food_recommendations sebelum to_json:\n", food_recommendations)
    print("sports_recommendations sebelum to_json:\n", sports_recommendations)

    return bmi, bmi_class, accuracy, str(classification_rep), food_recommendations, sports_recommendations

# --- Terima argumen dari Node.js ---
age = int(sys.argv[1])
height = float(sys.argv[2])
weight = float(sys.argv[3])

# --- Hitung BMI dan dapatkan rekomendasi ---
bmi, bmi_class, model_accuracy, model_report, food_recommendations, sports_recommendations = calculate_bmi_and_recommend(
    age, height, weight, food_data, sports_data)

# --- Kembalikan hasil dalam format JSON ---
results = {
    'bmi': bmi,
    'bmi_class': bmi_class,
    'food_recommendations': food_recommendations.to_json(orient='records'),
    'sports_recommendations': sports_recommendations.to_json(orient='records')
}

print("results sebelum dikirim:\n", results)
print(json.dumps(results))